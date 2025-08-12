import { streamingAIService } from '@/lib/ai-service-streaming';
import { CourseParser } from '@/lib/courseParser';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseSpec, userId, requestId } = body;

    if (!courseSpec || !userId) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: courseSpec and userId' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify user authentication (in a real app, you'd validate the token)
    const user = await authService.getCurrentUser();
    if (!user || user.id !== userId) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check user's generation limits
    const currentUsage = await db.findOne('aiGenerationUsage', { userId: user.id });
    if (!currentUsage) {
      return new Response(JSON.stringify({ 
        error: 'User generation usage not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (currentUsage.freeGenerationsUsed >= 3 && !currentUsage.subscriptionActive) {
      return new Response(JSON.stringify({ 
        error: 'Generation limit reached' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get academic level and subject
    const academicLevel = await db.findOne('academicLevels', { name: courseSpec.academicLevel });
    const subject = await db.findOne('subjects', { name: courseSpec.subject });

    if (!academicLevel || !subject) {
      return new Response(JSON.stringify({ 
        error: 'Invalid academic level or subject' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate the course
    let generatedCourse;
    try {
      generatedCourse = await streamingAIService.generateCourseWithStreaming(
        courseSpec,
        (progress) => {
          // In a real implementation, you might want to store progress updates
          // or send them via WebSocket/Server-Sent Events
          console.log('Generation progress:', progress);
        }
      );
    } catch (generationError) {
      console.error('Course generation failed:', generationError);
      return new Response(JSON.stringify({ 
        error: 'Course generation failed',
        details: generationError.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse and save the course
    try {
      const parsedData = CourseParser.parseAIGeneratedCourse(JSON.stringify(generatedCourse));
      
      const course = await db.insert('courses', {
        title: parsedData.course.title,
        description: parsedData.course.description,
        creatorId: user.id,
        creatorType: 'ai',
        academicLevelId: academicLevel.id,
        subjectId: subject.id,
        difficulty: courseSpec.difficulty,
        duration: courseSpec.duration,
        price: 0,
        currency: user.currency || 'USD',
        isPublished: true,
        isAiGenerated: true,
        objectives: parsedData.course.objectives,
        prerequisites: parsedData.course.prerequisites,
        estimatedTime: `${parsedData.course.estimatedHours} hours`,
        tags: [courseSpec.subject, courseSpec.academicLevel, courseSpec.difficulty],
        backgroundGenerated: true,
        generationRequestId: requestId
      });

      // Save lessons and related content
      await CourseParser.saveParsedCourseToDatabase(parsedData, course.id, db);

      // Update usage count
      await db.update('aiGenerationUsage', currentUsage.id, {
        freeGenerationsUsed: currentUsage.freeGenerationsUsed + 1
      });

      // Auto-enroll user in the course
      await db.insert('enrollments', {
        userId: user.id,
        courseId: course.id,
        status: 'active',
        paymentStatus: 'free'
      });

      return new Response(JSON.stringify({
        success: true,
        course: course,
        message: 'Course generated successfully in background'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (saveError) {
      console.error('Failed to save generated course:', saveError);
      return new Response(JSON.stringify({ 
        error: 'Failed to save generated course',
        details: saveError.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Background generation API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
