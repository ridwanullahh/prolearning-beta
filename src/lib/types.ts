export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  creatorId?: string;
  price: number;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
  academicLevelId?: string;
  subjectId?: string;
  enrollmentCount?: number;
  duration?: number;
  rating?: number;
  reviewCount?: number;
  objectives?: string;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface AcademicLevel {
  id: string;
  name: string;
  description: string;
  order: number;
}