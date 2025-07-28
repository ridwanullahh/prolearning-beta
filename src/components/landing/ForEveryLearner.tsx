import { motion } from 'framer-motion';
import { Baby, School, Library, Beaker, User, ArrowRight } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ForEveryLearner: React.FC = () => {
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
            Learning for Every{' '}
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              Stage of Life.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300 md:text-xl">
            Knowledge has no age limit. ProLearning is designed to be your
            lifelong learning companion, adapting to your needs as you grow.
          </p>
        </motion.div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-6">
          <Stage
            icon={Baby}
            title="Early Childhood"
            description="Spark curiosity with fun, foundational modules."
            delay={0}
          />
          <Stage
            icon={School}
            title="Primary & Secondary"
            description="Ace exams and build a strong academic foundation."
            delay={0.1}
          />
          <Stage
            icon={Library}
            title="University & College"
            description="Dive deep into your field of study, from research to exams."
            delay={0.2}
          />
          <Stage
            icon={Beaker}
            title="Postgraduate"
            description="Access specialized knowledge and cutting-edge topics."
            delay={0.3}
          />
          <Stage
            icon={User}
            title="Lifelong Learners"
            description="Pick up a new skill, explore a passion, or stay sharp."
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
              Find Your Learning Path
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

interface StageProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}

const Stage: React.FC<StageProps> = ({
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
    className="group relative transform-gpu overflow-hidden rounded-3xl bg-white p-6 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-gray-800"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative z-10">
      <div className="mb-4 inline-block rounded-full bg-gray-100 p-4 dark:bg-gray-700">
        <Icon className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  </motion.div>
);

export default ForEveryLearner;