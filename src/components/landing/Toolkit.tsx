import { motion } from 'framer-motion';
import {
  CheckSquare,
  Copy,
  GitBranch,
  List,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Toolkit: React.FC = () => {
  return (
    <section className="w-full bg-green-50/50 py-20 dark:bg-gray-900/50 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
            A Complete Toolkit for{' '}
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              Deeper Understanding
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300 md:text-xl">
            Every lesson on ProLearning is a complete learning ecosystem
            designed to help you absorb, retain, and apply knowledge
            effectively.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Tool
            icon={CheckSquare}
            title="Interactive Quizzes"
            description="Go beyond simple right-or-wrong. Our quizzes adapt to your answers, helping you pinpoint knowledge gaps."
          />
          <Tool
            icon={Copy}
            title="Smart Flashcards"
            description="Forget mindless repetition. Our system uses proven spaced-repetition algorithms to commit key info to memory."
          />
          <Tool
            icon={GitBranch}
            title="Visual Mind Maps"
            description="Instantly generate beautiful, intuitive mind maps that reveal the connections between complex ideas."
          />
          <Tool
            icon={List}
            title="Concise Keynotes"
            description="Our AI extracts the most critical takeaways and essential facts from any lesson for rapid revision."
          />
          <Tool
            icon={FileText}
            title="AI-Powered Summaries"
            description="Get an intelligent, context-aware summary in seconds. Your secret weapon for efficient studying."
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700"
          >
            <Sparkles className="mb-4 h-12 w-12 text-green-500" />
            <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
              And Many More
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We're constantly innovating to bring you the best learning tools.
            </p>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
          className="mt-16 text-center"
        >
          <Button asChild size="lg" className="group rounded-2xl">
            <Link to="/features">
              See All Features
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

interface ToolProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const Tool: React.FC<ToolProps> = ({ icon: Icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl dark:bg-gray-800"
  >
    <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-green-500/5 opacity-0 transition-all duration-500 group-hover:scale-150 group-hover:opacity-100 dark:bg-green-500/10" />
    <div className="relative z-10">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600 shadow-md dark:bg-gray-700 dark:text-green-400">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  </motion.div>
);

export default Toolkit;