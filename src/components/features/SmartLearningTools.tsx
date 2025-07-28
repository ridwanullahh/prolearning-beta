import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit } from 'lucide-react';
import React from 'react';

const SmartLearningTools = () => {
  return (
    <section
      id="smart-learning-tools"
      className="w-full bg-green-50/30 py-20 dark:bg-gray-900/30 md:py-24 lg:py-32"
    >
      <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2 md:px-6 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex justify-center md:order-2"
        >
          <div className="relative h-64 w-64">
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: -360 }}
              transition={{
                duration: 60,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <BrainCircuit className="h-full w-full text-green-200/50 dark:text-green-800/50" />
            </motion.div>
            <BrainCircuit className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 text-green-500" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-6 md:order-1"
        >
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-gray-800 dark:text-green-400">
              <BrainCircuit className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Smart Learning Tools
            </h2>
          </div>
          <p className="max-w-xl text-lg text-gray-600 dark:text-gray-300">
            From interactive flashcards to AI-driven study planners, we make
            learning more efficient and engaging. Our tools adapt to your
            learning style for a truly personalized experience.
          </p>
          <Button asChild size="lg" className="group rounded-2xl">
            <Link to="/dashboard">
              Explore Learning Tools
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default SmartLearningTools;