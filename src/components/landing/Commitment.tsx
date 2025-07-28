import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Commitment: React.FC = () => {
  return (
    <section className="w-full bg-white py-20 dark:bg-gray-950 md:py-24 lg:py-32">
      <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2 md:px-6 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex justify-center"
        >
          <div className="relative flex h-64 w-64 items-center justify-center">
            <div className="absolute h-full w-full rounded-full bg-gradient-to-br from-green-100 to-emerald-200 opacity-50 blur-2xl dark:from-gray-800 dark:to-gray-700" />
            <ShieldCheck className="relative z-10 h-32 w-32 text-green-600 dark:text-green-400" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Principled Innovation, Proven Pedagogy.
          </h2>
          <p className="mt-6 max-w-xl text-lg text-gray-600 dark:text-gray-300">
            We believe the future of education must be built on a foundation of
            trust and effectiveness. Our platform is more than just
            technology; it's a commitment to making world-class education
            accessible and to grounding our AI in learning science that
            truly works.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" variant="outline" className="group rounded-2xl">
              <Link to="/about">
                Our Commitment to You
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Commitment;