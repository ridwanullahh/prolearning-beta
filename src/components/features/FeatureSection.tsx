import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import React from 'react';

interface FeatureSectionProps {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  cta: string;
  link: string;
  image: string;
  isReversed?: boolean;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({
  id,
  icon: Icon,
  title,
  description,
  cta,
  link,
  image,
  isReversed = false,
}) => {
  return (
    <section
      id={id}
      className={`w-full py-20 md:py-24 lg:py-32 ${isReversed ? 'bg-green-50/30 dark:bg-gray-900/30' : 'bg-white dark:bg-gray-950'}`}
    >
      <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2 md:px-6 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: isReversed ? 50 : -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`flex justify-center ${isReversed ? 'md:order-2' : ''}`}
        >
          <img
            src={image}
            alt={title}
            className="rounded-2xl object-cover shadow-2xl"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: isReversed ? -50 : 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`space-y-6 ${isReversed ? 'md:order-1' : ''}`}
        >
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-gray-800 dark:text-green-400">
              <Icon className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {title}
            </h2>
          </div>
          <p className="max-w-xl text-lg text-gray-600 dark:text-gray-300">
            {description}
          </p>
          <Button asChild size="lg" className="group rounded-2xl">
            <Link to={link}>
              Learn More
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSection;