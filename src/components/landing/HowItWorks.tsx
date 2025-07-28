import { motion } from 'framer-motion';
import { Compass, BookOpen, BarChart, ArrowRight } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HowItWorks: React.FC = () => {
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
            Unlock Knowledge in Three Simple Steps
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300 md:text-xl">
            We've engineered a powerful platform that's incredibly easy to
            navigate. Your journey to mastery is clear and intuitive.
          </p>
        </motion.div>
        <div className="relative">
          <div
            className="absolute left-1/2 top-12 -z-0 h-[calc(100%-6rem)] w-1 -translate-x-1/2 bg-gradient-to-b from-green-200 via-emerald-200 to-teal-200 dark:from-green-800/50 dark:via-emerald-800/50 dark:to-teal-800/50"
            aria-hidden="true"
          />
          <div className="space-y-24">
            <Step
              icon={Compass}
              stepNumber={1}
              title="Discover Your Course"
              description="Choose from our library of expert-led courses or command our AI to generate a custom course on any topic imaginable."
              isReversed={false}
            />
            <Step
              icon={BookOpen}
              stepNumber={2}
              title="Engage & Learn"
              description="Dive into dynamic lessons equipped with our full suite of learning tools. Take quizzes, use flashcards, and explore mind maps."
              isReversed={true}
            />
            <Step
              icon={BarChart}
              stepNumber={3}
              title="Track Your Mastery"
              description="Watch your progress in real-time. Our platform provides clear insights into your strengths and areas for improvement."
              isReversed={false}
            />
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
          className="mt-20 text-center"
        >
          <Button asChild size="lg" className="group rounded-2xl">
            <Link to="/auth/register">
              Start Your First Lesson
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

interface StepProps {
  icon: React.ElementType;
  stepNumber: number;
  title: string;
  description: string;
  isReversed: boolean;
}

const Step: React.FC<StepProps> = ({
  icon: Icon,
  stepNumber,
  title,
  description,
  isReversed,
}) => {
  const contentVariants = {
    hidden: { opacity: 0, x: isReversed ? 100 : -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut', delay: 0.2 },
    },
  };

  return (
    <div
      className={`relative flex items-center ${isReversed ? 'flex-row-reverse' : ''}`}
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={iconVariants}
        className="relative z-10 flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-lg dark:bg-gray-800"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white">
          <Icon className="h-10 w-10" />
        </div>
        <span className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-gray-900 text-lg font-bold text-white dark:border-gray-800 dark:bg-white dark:text-gray-900">
          {stepNumber}
        </span>
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={contentVariants}
        className={`w-full rounded-2xl bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800 md:w-2/5 ${isReversed ? 'mr-12' : 'ml-12'}`}
      >
        <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </motion.div>
    </div>
  );
};

export default HowItWorks;