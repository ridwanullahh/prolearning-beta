import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import React from 'react';

const ExpertVerifiedContent = () => {
  return (
    <section
      id="expert-verified-content"
      className="w-full bg-white py-20 dark:bg-gray-950 md:py-24 lg:py-32"
    >
      <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2 md:px-6 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex justify-center"
        >
          <div className="relative h-64 w-64">
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <ShieldCheck className="h-full w-full text-green-200/50 dark:text-green-800/50" />
            </motion.div>
            <ShieldCheck className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 text-green-500" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-6"
        >
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-gray-800 dark:text-green-400">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Expert-Verified Content
            </h2>
          </div>
          <p className="max-w-xl text-lg text-gray-600 dark:text-gray-300">
            All our content is created and reviewed by subject matter experts
            to ensure accuracy and quality. Learn with confidence from
            trusted sources.
          </p>
          <Button asChild size="lg" className="group rounded-2xl">
            <Link to="/marketplace">
              Browse Expert Courses
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ExpertVerifiedContent;