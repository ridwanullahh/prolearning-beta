
import CourseViewer from '@/components/course/CourseViewer';
import FloatingToolbar from '@/components/global/FloatingToolbar';

const CoursePage = () => {
  return (
    <div className="relative min-h-screen">
      <CourseViewer />
      <FloatingToolbar />
    </div>
  );
};

export default CoursePage;
