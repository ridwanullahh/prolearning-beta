import { motion } from 'framer-motion';
import { BrainCircuit, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const BeyondMemorization = () => {
  return (
    <section className="w-full bg-white py-20 dark:bg-gray-950 md:py-24 lg:py-32">
      <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2 md:px-6 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
            From Information to{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Application.
            </span>
          </h2>
          <p className="mt-6 max-w-xl text-lg text-gray-600 dark:text-gray-300 md:text-xl">
            True learning isn't about memorizing facts; it's about building
            applicable skills. ProLearning is designed to take you beyond the
            surface level, fostering critical thinking and genuine
            comprehension that you can carry into the real world.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" variant="outline" className="group rounded-2xl">
              <Link to="/about">
                Learn About Our Philosophy
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
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
              <BrainCircuit className="h-full w-full text-green-200/80 dark:text-green-800/50" />
            </motion.div>
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: -360 }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <BrainCircuit className="h-full w-full scale-75 transform text-emerald-200/80 dark:text-emerald-800/50" />
            </motion.div>
            <BrainCircuit className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 text-green-500" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BeyondMemorization;