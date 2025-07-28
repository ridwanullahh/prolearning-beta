import { motion } from 'framer-motion';
import { Bot, UserCheck, ArrowRight } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ValueProposition: React.FC = () => {
  return (
    <section className="w-full bg-white py-20 dark:bg-gray-950 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              AI Power,
            </span>{' '}
            Human Touch.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300 md:text-xl">
            We've unified two powerful approaches to learning so you never have
            to compromise. Get the best of both worlds in one seamless platform.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:gap-12">
          <ValueCard
            icon={Bot}
            title="AI-Generated Courses"
            description="Experience the future, today. Our advanced AI can instantly generate comprehensive courses on virtually any subject."
            features={[
              'Personalized Paths',
              'Limitless Subjects',
              'Instant Creation',
            ]}
            className="from-teal-50 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30"
          />
          <ValueCard
            icon={UserCheck}
            title="Expert-Crafted Courses"
            description="Learn from the best. Our library features courses meticulously designed by leading educators and industry professionals."
            features={[
              'Unmatched Quality',
              'Structured Learning',
              'Real-World Insight',
            ]}
            className="from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
          className="mt-16 text-center"
        >
          <Button asChild size="lg" className="group rounded-2xl">
            <Link to="/marketplace">
              Explore Our Course Catalog
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

interface ValueCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  className?: string;
}

const ValueCard: React.FC<ValueCardProps> = ({
  icon: Icon,
  title,
  description,
  features,
  className,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.95 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.7, ease: 'easeOut' }}
    className={`flex h-full flex-col rounded-3xl bg-gradient-to-br p-8 shadow-lg transition-all duration-300 hover:shadow-2xl dark:shadow-gray-950/50 ${className}`}
  >
    <div className="mb-6 flex items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-green-600 shadow-md dark:bg-gray-800 dark:text-green-400">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
    </div>
    <p className="mb-6 flex-grow text-gray-700 dark:text-gray-300">
      {description}
    </p>
    <ul className="space-y-3">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <Checkmark />
          <span className="ml-3 font-medium text-gray-800 dark:text-gray-200">
            {feature}
          </span>
        </li>
      ))}
    </ul>
  </motion.div>
);

const Checkmark = () => (
  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
    <svg
      className="h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  </div>
);

export default ValueProposition;