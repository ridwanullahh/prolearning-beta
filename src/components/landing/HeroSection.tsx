import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-green-50/50 dark:bg-gray-900">
      <div className="container relative z-10 mx-auto grid min-h-screen items-center px-4 pt-20 text-center md:pt-0 lg:grid-cols-2 lg:text-left">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-6"
        >
          <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">Intelligent Learning,</span>
            <span className="block bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              Infinite Possibilities.
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-gray-600 dark:text-gray-300 lg:mx-0">
            ProLearning is where human expertise meets artificial intelligence.
            Get a personalized, engaging, and effective learning experience
            tailored just for you.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            <Button
              asChild
              size="lg"
              className="group w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-green-500/50 sm:w-auto"
            >
              <Link to="/auth/register">
                Start Learning Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="group w-full rounded-2xl border-2 border-gray-300 bg-white/50 px-8 py-4 text-lg font-bold text-gray-700 shadow-sm backdrop-blur-sm transition-all duration-300 ease-in-out hover:scale-105 hover:border-green-400 hover:bg-white dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 dark:hover:border-green-500 dark:hover:bg-gray-800 sm:w-auto"
            >
              <Link to="/marketplace">
                <BookOpen className="mr-2 h-5 w-5" />
                Explore Courses
              </Link>
            </Button>
          </div>
        </motion.div>
        <div className="relative hidden h-full items-center justify-center lg:flex">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.2,
            }}
            className="relative h-96 w-96"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-200 to-emerald-200 opacity-50 blur-3xl dark:from-green-900/50 dark:to-emerald-900/50" />
            <motion.div
              className="absolute inset-8 rounded-full border-4 border-dashed border-green-400/50"
              animate={{ rotate: 360 }}
              transition={{
                duration: 60,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <motion.div
              className="absolute inset-16 rounded-full bg-white/50 dark:bg-gray-800/50"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.5 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.7 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <GraduationCap className="h-32 w-32 text-green-600 dark:text-green-400" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Re-import GraduationCap if it's not globally available
import { GraduationCap } from 'lucide-react';

export default HeroSection;