
export interface ParsedLesson {
  title: string;
  description: string;
  content: string;
  duration: number;
  order: number;
  objectives: string[];
  quiz?: ParsedQuiz;
  flashcards?: ParsedFlashcard[];
  keyPoints?: ParsedKeyPoint[];
  mindMap?: ParsedMindMap;
}

export interface ParsedQuiz {
  title: string;
  description: string;
  questions: ParsedQuestion[];
  totalQuestions: number;
  passingScore: number;
  timeLimit?: number;
  instructions: string;
}

export interface ParsedQuestion {
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'fill_in_blank' | 'essay' | 'true_false';
  options?: string[];
  correct_answer: string;
  explanation: string;
  points?: number;
}

export interface ParsedFlashcard {
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
  explanation?: string;
}

export interface ParsedKeyPoint {
  point: string;
  explanation: string;
  importance: 'low' | 'medium' | 'high';
  category?: string;
  examples?: string[];
}

export interface ParsedMindMap {
  title: string;
  nodes: MindMapNode[];
}

export interface MindMapNode {
  id: string;
  label: string;
  children?: string[];
  parent?: string;
  level?: number;
}

export class CourseParser {
  static parseAIGeneratedCourse(content: string): {
    course: any;
    lessons: ParsedLesson[];
  } {
    try {
      // Extract JSON from the content if it's wrapped in markdown
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      let courseData;
      
      if (jsonMatch) {
        courseData = JSON.parse(jsonMatch[1]);
      } else {
        // Try to parse as direct JSON
        courseData = JSON.parse(content);
      }

      // Extract course information
      const course = {
        title: courseData.title || 'Untitled Course',
        description: courseData.description || '',
        objectives: courseData.objectives ? courseData.objectives.join('\n') : '',
        prerequisites: courseData.prerequisites ? courseData.prerequisites.join('\n') : '',
        difficulty: courseData.difficulty || 'beginner',
        estimatedHours: courseData.estimatedHours || courseData.duration || 1
      };

      // Parse lessons
      const lessons: ParsedLesson[] = [];
      if (courseData.lessons && Array.isArray(courseData.lessons)) {
        courseData.lessons.forEach((lessonData: any, index: number) => {
          const lesson = this.parseLesson(lessonData, index + 1);
          lessons.push(lesson);
        });
      }

      return { course, lessons };
    } catch (error) {
      console.error('Error parsing AI generated course:', error);
      
      // Return a basic structure if parsing fails
      return {
        course: {
          title: 'AI Generated Course',
          description: 'Course content from AI generation',
          objectives: '',
          prerequisites: '',
          difficulty: 'beginner',
          estimatedHours: 1
        },
        lessons: [{
          title: 'Introduction',
          description: 'Course introduction',
          content: content,
          duration: 30,
          order: 1,
          objectives: []
        }]
      };
    }
  }

  private static parseLesson(lessonData: any, order: number): ParsedLesson {
    const lesson: ParsedLesson = {
      title: lessonData.title || `Lesson ${order}`,
      description: lessonData.description || '',
      content: lessonData.content || '',
      duration: lessonData.duration || 30,
      order: order,
      objectives: Array.isArray(lessonData.objectives) ? lessonData.objectives : []
    };

    // Parse quiz if available
    if (lessonData.quiz) {
      lesson.quiz = this.parseQuiz(lessonData.quiz);
    }

    // Parse flashcards if available
    if (lessonData.flashcards && Array.isArray(lessonData.flashcards)) {
      lesson.flashcards = lessonData.flashcards.map((card: any) => this.parseFlashcard(card));
    }

    // Parse key points if available
    if (lessonData.keyPoints && Array.isArray(lessonData.keyPoints)) {
      lesson.keyPoints = lessonData.keyPoints.map((point: any) => this.parseKeyPoint(point));
    }

    // Parse mind map if available
    if (lessonData.mindMap) {
      lesson.mindMap = this.parseMindMap(lessonData.mindMap);
    }

    return lesson;
  }

  private static parseQuiz(quizData: any): ParsedQuiz {
    return {
      title: quizData.title || 'Lesson Quiz',
      description: quizData.description || 'Test your understanding',
      questions: Array.isArray(quizData.questions) 
        ? quizData.questions.map((q: any) => this.parseQuestion(q))
        : [],
      totalQuestions: quizData.questions?.length || 0,
      passingScore: quizData.passingScore || 70,
      timeLimit: quizData.timeLimit,
      instructions: quizData.instructions || 'Choose the best answer for each question.'
    };
  }

  private static parseQuestion(questionData: any): ParsedQuestion {
    return {
      question: questionData.question || '',
      type: questionData.type || 'multiple_choice',
      options: questionData.options || [],
      correct_answer: questionData.correct_answer || '',
      explanation: questionData.explanation || '',
      points: questionData.points || 1
    };
  }

  private static parseFlashcard(cardData: any): ParsedFlashcard {
    return {
      front: cardData.front || '',
      back: cardData.back || '',
      difficulty: cardData.difficulty || 'medium',
      hint: cardData.hint,
      explanation: cardData.explanation
    };
  }

  private static parseKeyPoint(pointData: any): ParsedKeyPoint {
    return {
      point: pointData.point || '',
      explanation: pointData.explanation || '',
      importance: pointData.importance || 'medium',
      category: pointData.category,
      examples: Array.isArray(pointData.examples) ? pointData.examples : []
    };
  }

  private static parseMindMap(mindMapData: any): ParsedMindMap {
    const nodes: MindMapNode[] = [];
    
    if (mindMapData.nodes && Array.isArray(mindMapData.nodes)) {
      mindMapData.nodes.forEach((nodeData: any) => {
        nodes.push({
          id: nodeData.id || Math.random().toString(36).substr(2, 9),
          label: nodeData.label || '',
          children: nodeData.children || [],
          parent: nodeData.parent,
          level: nodeData.level || 0
        });
      });
    }

    return {
      title: mindMapData.title || 'Mind Map',
      nodes
    };
  }

  static async saveParsedCourseToDatabase(
    parsedData: { course: any; lessons: ParsedLesson[] },
    courseId: string,
    db: any
  ): Promise<void> {
    try {
      // Update course with parsed information
      await db.update('courses', courseId, {
        objectives: parsedData.course.objectives,
        prerequisites: parsedData.course.prerequisites,
        estimatedTime: `${parsedData.course.estimatedHours} hours`,
        updatedAt: new Date().toISOString()
      });

      const lessonsToInsert: any[] = [];
      const lessonContentsToInsert: any[] = [];
      const quizzesToInsert: any[] = [];
      const flashcardsToInsert: any[] = [];
      const keyPointsToInsert: any[] = [];
      const mindMapsToInsert: any[] = [];

      // Save lessons and related content
      for (const lessonData of parsedData.lessons) {
        // Create lesson
        const lesson = {
          courseId,
          title: lessonData.title,
          description: lessonData.description,
          order: lessonData.order,
          duration: lessonData.duration,
          type: 'text',
          isRequired: true,
          objectives: lessonData.objectives.join('\n'),
          isPublished: true,
          isAiGenerated: true,
          releaseType: 'immediate'
        };
        const insertedLesson = await db.insert('lessons', lesson);
        
        // Create lesson content
        lessonContentsToInsert.push({
          lessonId: insertedLesson.id,
          type: 'rich_text',
          content: lessonData.content,
          order: 1,
          title: 'Main Content',
          isRequired: true
        });

        // Save quiz if available
        if (lessonData.quiz) {
          quizzesToInsert.push({
            lessonId: insertedLesson.id,
            courseId,
            title: lessonData.quiz.title,
            description: lessonData.quiz.description,
            questions: lessonData.quiz.questions,
            totalQuestions: lessonData.quiz.totalQuestions,
            passingScore: lessonData.quiz.passingScore,
            timeLimit: lessonData.quiz.timeLimit || 30,
            attempts: 3,
            isActive: true,
            instructions: lessonData.quiz.instructions
          });
        }

        // Save flashcards if available
        if (lessonData.flashcards) {
          lessonData.flashcards.forEach((flashcard, i) => {
            flashcardsToInsert.push({
              lessonId: insertedLesson.id,
              courseId,
              front: flashcard.front,
              back: flashcard.back,
              difficulty: flashcard.difficulty,
              order: i + 1,
              hint: flashcard.hint || '',
              explanation: flashcard.explanation || ''
            });
          });
        }

        // Save key points if available
        if (lessonData.keyPoints) {
          lessonData.keyPoints.forEach((keyPoint, i) => {
            keyPointsToInsert.push({
              lessonId: insertedLesson.id,
              courseId,
              point: keyPoint.point,
              explanation: keyPoint.explanation,
              order: i + 1,
              importance: keyPoint.importance,
              category: keyPoint.category || 'general',
              examples: keyPoint.examples ? keyPoint.examples.join('\n') : ''
            });
          });
        }

        // Save mind map if available
        if (lessonData.mindMap) {
          mindMapsToInsert.push({
            lessonId: insertedLesson.id,
            courseId,
            title: lessonData.mindMap.title,
            data: { nodes: lessonData.mindMap.nodes }, // Wrap nodes in data object
            nodeCount: lessonData.mindMap.nodes.length,
            connections: lessonData.mindMap.nodes.filter(n => n.children && n.children.length > 0)
          });
        }
      }
      
      // Bulk insert all the things with detailed logging
      console.log('Saving course content to database:', {
        lessonContents: lessonContentsToInsert.length,
        quizzes: quizzesToInsert.length,
        flashcards: flashcardsToInsert.length,
        keyPoints: keyPointsToInsert.length,
        mindMaps: mindMapsToInsert.length
      });

      if (lessonContentsToInsert.length > 0) {
        console.log('Saving lesson contents...');
        await db.bulkInsert('lessonContents', lessonContentsToInsert);
      }

      if (quizzesToInsert.length > 0) {
        console.log('Saving quizzes...');
        await db.bulkInsert('quizzes', quizzesToInsert);
      }

      if (flashcardsToInsert.length > 0) {
        console.log('Saving flashcards...');
        await db.bulkInsert('flashcards', flashcardsToInsert);
      }

      if (keyPointsToInsert.length > 0) {
        console.log('Saving key points...');
        await db.bulkInsert('keyPoints', keyPointsToInsert);
      }

      if (mindMapsToInsert.length > 0) {
        console.log('Saving mind maps...');
        await db.bulkInsert('mindMaps', mindMapsToInsert);
      }

      console.log('All course content saved successfully');

    } catch (error) {
      console.error('Error saving parsed course to database:', error);
      throw error;
    }
  }
}
