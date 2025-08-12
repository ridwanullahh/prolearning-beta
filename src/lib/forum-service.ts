import { db } from './github-sdk';

interface Course {
  id: string;
  title: string;
  isAiGenerated?: boolean;
  creatorType?: string;
}

interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
}

interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  order: number;
}

class ForumService {
  /**
   * Creates the complete forum hierarchy for a course
   * Only creates forums for instructor-led courses (not AI-generated)
   */
  async createCourseForumHierarchy(courseId: string): Promise<void> {
    try {
      // Get course details
      const course = await db.getItem('courses', courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // Skip forum creation for AI-generated courses
      if (course.isAiGenerated || course.creatorType === 'ai') {
        console.log('Skipping forum creation for AI-generated course');
        return;
      }

      // Create main course forum
      const mainForum = await this.createMainCourseForum(course);

      // Create general discussion forum
      await this.createGeneralForum(course, mainForum.id);

      // Get all modules for the course
      const modules = await db.queryBuilder('modules')
        .where((m: Module) => m.courseId === courseId)
        .orderBy('order', 'asc')
        .exec();

      // Create module sub-forums and lesson threads
      for (const module of modules) {
        await this.createModuleSubForum(course, module, mainForum.id);
      }

    } catch (error) {
      console.error('Error creating course forum hierarchy:', error);
      throw error;
    }
  }

  /**
   * Creates the main course forum
   */
  private async createMainCourseForum(course: Course) {
    return await db.insert('forums', {
      courseId: course.id,
      title: `${course.title} - Course Forum`,
      description: `Main discussion forum for ${course.title}`,
      type: 'course',
      isActive: true,
      isAutoCreated: true,
      order: 0
    });
  }

  /**
   * Creates a general discussion forum
   */
  private async createGeneralForum(course: Course, parentForumId: string) {
    return await db.insert('forums', {
      courseId: course.id,
      parentForumId,
      title: 'General Discussion',
      description: 'General course discussions and announcements',
      type: 'general',
      isActive: true,
      isAutoCreated: true,
      order: 1
    });
  }

  /**
   * Creates a module sub-forum and its lesson threads
   */
  private async createModuleSubForum(course: Course, module: Module, parentForumId: string) {
    // Create module sub-forum
    const moduleForum = await db.insert('forums', {
      courseId: course.id,
      moduleId: module.id,
      parentForumId,
      title: `Module ${module.order + 1}: ${module.title}`,
      description: `Discussion forum for ${module.title}`,
      type: 'module',
      isActive: true,
      isAutoCreated: true,
      order: module.order + 2 // +2 to account for main and general forums
    });

    // Get all lessons for this module
    const lessons = await db.queryBuilder('lessons')
      .where((l: Lesson) => l.moduleId === module.id)
      .orderBy('order', 'asc')
      .exec();

    // Create lesson threads
    for (const lesson of lessons) {
      await this.createLessonThreadInternal(course, module, lesson, moduleForum.id);
    }
  }

  /**
   * Creates a dedicated thread for a lesson
   */
  private async createLessonThreadInternal(course: Course, module: Module, lesson: Lesson, forumId: string) {
    return await db.insert('forumThreads', {
      forumId,
      courseId: course.id,
      moduleId: module.id,
      lessonId: lesson.id,
      userId: course.instructorId || 'system', // Use instructor or system as creator
      title: `Lesson ${lesson.order + 1}: ${lesson.title} - Discussion`,
      content: `This is the dedicated discussion thread for "${lesson.title}". Feel free to ask questions, share insights, or discuss the lesson content.`,
      type: 'lesson',
      isPinned: true,
      isLocked: false,
      isAnswered: false,
      isAutoCreated: true,
      tags: ['lesson', 'auto-created'],
      viewCount: 0,
      lastActivityAt: new Date().toISOString(),
      lastActivityUserId: course.instructorId || 'system'
    });
  }

  /**
   * Creates forum hierarchy when a new module is added
   */
  async createModuleForumHierarchy(moduleId: string): Promise<void> {
    try {
      const module = await db.getItem('modules', moduleId);
      if (!module) {
        throw new Error('Module not found');
      }

      const course = await db.getItem('courses', module.courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // Skip for AI-generated courses
      if (course.isAiGenerated || course.creatorType === 'ai') {
        return;
      }

      // Find the main course forum
      const mainForum = await db.queryBuilder('forums')
        .where((f: any) => f.courseId === module.courseId && f.type === 'course')
        .exec();

      if (mainForum.length === 0) {
        // Create the entire hierarchy if main forum doesn't exist
        await this.createCourseForumHierarchy(module.courseId);
        return;
      }

      // Create module sub-forum
      await this.createModuleSubForum(course, module, mainForum[0].id);

    } catch (error) {
      console.error('Error creating module forum hierarchy:', error);
      throw error;
    }
  }

  /**
   * Creates a lesson thread when a new lesson is added
   */
  async createLessonThread(lessonId: string): Promise<void> {
    try {
      const lesson = await db.getItem('lessons', lessonId);
      if (!lesson) {
        throw new Error('Lesson not found');
      }

      const [course, module] = await Promise.all([
        db.getItem('courses', lesson.courseId),
        db.getItem('modules', lesson.moduleId)
      ]);

      if (!course || !module) {
        throw new Error('Course or module not found');
      }

      // Skip for AI-generated courses
      if (course.isAiGenerated || course.creatorType === 'ai') {
        return;
      }

      // Find the module forum
      const moduleForum = await db.queryBuilder('forums')
        .where((f: any) => f.moduleId === module.id && f.type === 'module')
        .exec();

      if (moduleForum.length === 0) {
        // Create module forum if it doesn't exist
        await this.createModuleForumHierarchy(module.id);
        return;
      }

      // Create lesson thread
      await this.createLessonThreadInternal(course, module, lesson, moduleForum[0].id);

    } catch (error) {
      console.error('Error creating lesson thread:', error);
      throw error;
    }
  }

  /**
   * Gets the forum hierarchy for a course
   */
  async getCourseForumHierarchy(courseId: string) {
    try {
      // Get all forums for the course
      const forums = await db.queryBuilder('forums')
        .where((f: any) => f.courseId === courseId)
        .orderBy('order', 'asc')
        .exec();

      // Get all threads for the course
      const threads = await db.queryBuilder('forumThreads')
        .where((t: any) => t.courseId === courseId)
        .exec();

      // Organize into hierarchy
      const hierarchy = {
        mainForum: forums.find((f: any) => f.type === 'course'),
        generalForum: forums.find((f: any) => f.type === 'general'),
        moduleForums: forums.filter((f: any) => f.type === 'module').map((forum: any) => ({
          ...forum,
          threads: threads.filter((t: any) => t.forumId === forum.id)
        }))
      };

      return hierarchy;
    } catch (error) {
      console.error('Error getting course forum hierarchy:', error);
      throw error;
    }
  }

  /**
   * Checks if user can create forums/threads (only instructors for instructor-led courses)
   */
  async canUserCreateContent(courseId: string, userId: string): Promise<boolean> {
    try {
      const course = await db.getItem('courses', courseId);
      if (!course) return false;

      // AI-generated courses don't allow user-created content
      if (course.isAiGenerated || course.creatorType === 'ai') {
        return false;
      }

      // Only course instructor can create forums/threads
      return course.instructorId === userId;
    } catch (error) {
      console.error('Error checking user permissions:', error);
      return false;
    }
  }
}

export const forumService = new ForumService();
