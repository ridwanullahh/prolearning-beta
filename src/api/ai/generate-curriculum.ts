import { aiService } from '@/lib/ai-service-streaming';
import { aiGuidelinesService } from '@/lib/ai-guidelines-service';

export async function POST(request: Request) {
  try {
    const { prompt, stream = false } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get AI guidelines for curriculum generation
    const guidelinesPrompt = await aiGuidelinesService.buildGuidelinesPrompt('curriculum', 'curriculum');
    
    const fullPrompt = `${guidelinesPrompt}

${prompt}

Please provide a comprehensive curriculum structure in markdown format that includes:

1. **Course Overview**
   - Brief description
   - Target audience
   - Prerequisites
   - Learning outcomes

2. **Module Structure**
   - Module titles and descriptions
   - Learning objectives for each module
   - Estimated duration

3. **Lesson Breakdown**
   - Lesson titles and brief descriptions
   - Key topics covered
   - Activities and assessments

4. **Assessment Strategy**
   - Types of assessments
   - Grading criteria
   - Project ideas

5. **Resources and Materials**
   - Required textbooks/materials
   - Supplementary resources
   - Online tools and platforms

Format the response in clear, well-structured markdown that can be easily edited and customized.`;

    if (stream) {
      // Return streaming response
      const response = await aiService.generateCourseContent(fullPrompt, 'curriculum');
      
      // Create a readable stream
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Split response into chunks and stream them
          const chunks = response.split(' ');
          let index = 0;
          
          const sendChunk = () => {
            if (index < chunks.length) {
              const chunk = chunks[index] + ' ';
              controller.enqueue(encoder.encode(chunk));
              index++;
              setTimeout(sendChunk, 50); // Simulate streaming delay
            } else {
              controller.close();
            }
          };
          
          sendChunk();
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain',
          'Transfer-Encoding': 'chunked'
        }
      });
    } else {
      // Return complete response
      const response = await aiService.generateCourseContent(fullPrompt, 'curriculum');
      
      return new Response(response, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

  } catch (error) {
    console.error('Curriculum generation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate curriculum',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
