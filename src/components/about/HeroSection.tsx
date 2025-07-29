import { motion } from 'framer-motion';

const HeroSection = () => (
  <section className="bg-green-50/50 py-20 text-center dark:bg-gray-900/50">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="container mx-auto px-4"
    >
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
        Our Mission is to Make True Learning{' '}
        <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
          Limitless.
        </span>
      </h1>
      <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
        We believe that education is the most powerful force for progress. At
        ProLearning, we are dedicated to building a future where every
        individual has access to a truly responsive and profoundly effective
        learning experience.
      </p>
    </motion.div>
  </section>
);

export default HeroSection;