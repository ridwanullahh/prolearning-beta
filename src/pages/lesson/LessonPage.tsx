
import { useParams } from 'react-router-dom';
import EnhancedLessonViewer from '@/components/course/EnhancedLessonViewer';

const LessonPage = () => {
  const { id } = useParams();
  const courseId = 'default-course'; // This should be passed via route params or context

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lesson Not Found</h1>
          <p className="text-gray-600">The requested lesson could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <EnhancedLessonViewer 
          lessonId={id} 
          courseId={courseId}
          onNext={() => {
            // Handle navigation to next lesson
            console.log('Navigate to next lesson');
          }}
          onPrevious={() => {
            // Handle navigation to previous lesson
            console.log('Navigate to previous lesson');
          }}
        />
      </div>
    </div>
  );
};

export default LessonPage;
