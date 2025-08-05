import { db } from './github-sdk';

class CourseTrackService {
  async createCourseTrack(
    instructorId: string,
    title: string,
    description: string,
    price: number,
    tags: string[],
    level: string,
    courseIds: string[]
  ) {
    const courseTrack = await db.insert('courseTracks', {
      instructorId,
      title,
      description,
      price,
      tags,
      level,
      isPublished: false,
    });

    for (let i = 0; i < courseIds.length; i++) {
      await db.insert('courseTrackCourses', {
        courseTrackId: courseTrack.id,
        courseId: courseIds[i],
        order: i,
        prerequisiteCourseId: null, // Placeholder for future implementation
      });
    }

    return courseTrack;
  }

  async updateCourseTrack(
    trackId: string,
    updates: {
      title?: string;
      description?: string;
      price?: number;
      tags?: string[];
      level?: string;
      isPublished?: boolean;
    }
  ) {
    return await db.update('courseTracks', trackId, updates);
  }

  async deleteCourseTrack(trackId: string) {
    // First, delete all courses associated with the track
    const trackCourses = await db.queryBuilder('courseTrackCourses').where((c: any) => c.courseTrackId === trackId).exec();
    for (const tc of trackCourses) {
      await db.delete('courseTrackCourses', tc.id);
    }

    // Then, delete the track itself
    return await db.delete('courseTracks', trackId);
  }

  async enrollInCourseTrack(userId: string, courseTrackId: string) {
    const existingEnrollment = await db.queryBuilder('courseTrackEnrollments').where((e: any) => e.userId === userId && e.courseTrackId === courseTrackId).first();
    if (existingEnrollment) {
      throw new Error('User is already enrolled in this course track.');
    }

    return await db.insert('courseTrackEnrollments', {
      userId,
      courseTrackId,
      progress: 0,
      completed: false,
    });
  }
}

export const courseTrackService = new CourseTrackService();