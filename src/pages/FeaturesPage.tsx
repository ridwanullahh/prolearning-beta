import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AiCourseGeneration from '@/components/features/AiCourseGeneration';
import SmartLearningTools from '@/components/features/SmartLearningTools';
import ExpertVerifiedContent from '@/components/features/ExpertVerifiedContent';
import GlobalCurriculum from '@/components/features/GlobalCurriculum';
import CollaborativeLearning from '@/components/features/CollaborativeLearning';
import ProgressTracking from '@/components/features/ProgressTracking';

const FeaturesPage = () => {
  return (
    <div className="bg-white dark:bg-gray-950">
      <Header />
      <main>
        <section className="bg-green-50/50 py-20 text-center dark:bg-gray-900/50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="container mx-auto px-4"
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              Features That{' '}
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                Empower Your Learning
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              ProLearning is packed with powerful features designed to provide a
              personalized, engaging, and effective learning experience.
            </p>
          </motion.div>
        </section>

        <AiCourseGeneration />
        <SmartLearningTools />
        <ExpertVerifiedContent />
        <GlobalCurriculum />
        <CollaborativeLearning />
        <ProgressTracking />
      </main>
      <Footer />
    </div>
  );
};

export default FeaturesPage;