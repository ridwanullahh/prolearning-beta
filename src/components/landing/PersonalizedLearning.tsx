import { motion } from 'framer-motion';
import { Sliders, Compass, Target, ArrowRight } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PersonalizedLearning: React.FC = () => {
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
            No Two Minds Learn Alike.
            <br />
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Neither Should Your Courses.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300 md:text-xl">
            Standardized education is a thing of the past. ProLearning’s AI
            core acts as your personal academic guide, dynamically tailoring
            your curriculum for maximum impact.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
          <Feature
            icon={Sliders}
            title="Adaptive Difficulty"
            description="The platform adjusts in real-time to keep you challenged but not overwhelmed."
            delay={0}
          />
          <Feature
            icon={Compass}
            title="Interest-Based Discovery"
            description="Our AI recommends new topics and courses based on what you already love to learn."
            delay={0.2}
          />
          <Feature
            icon={Target}
            title="Goal-Oriented Pathways"
            description="Tell us your goal, and we'll build the most efficient learning path to get you there."
            delay={0.4}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.6 }}
          className="mt-16 text-center"
        >
          <Button asChild size="lg" className="group rounded-2xl">
            <Link to="/auth/register">
              Create Your Custom Path
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

interface FeatureProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}

const Feature: React.FC<FeatureProps> = ({
  icon: Icon,
  title,
  description,
  delay,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.6, ease: 'easeOut', delay }}
    className="group relative flex flex-col items-center rounded-3xl bg-green-50/50 p-8 text-center shadow-lg transition-all duration-300 hover:bg-white hover:shadow-2xl dark:bg-gray-800/50 dark:hover:bg-gray-800"
  >
    <div className="absolute inset-0 rounded-3xl border border-transparent opacity-0 transition-opacity duration-300 group-hover:border-green-500 group-hover:opacity-100" />
    <div className="relative z-10">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-200 dark:from-gray-700 dark:to-gray-600">
        <Icon className="h-10 w-10 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="max-w-xs text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  </motion.div>
);

export default PersonalizedLearning;