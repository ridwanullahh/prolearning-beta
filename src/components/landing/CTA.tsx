import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTA = () => {
  return (
    <section className="w-full bg-white py-20 dark:bg-gray-950 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 p-12 text-center shadow-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10"
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
              Ready to Transform How You Learn?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-green-100 md:text-xl">
              Your personalized educational journey is just one click away.
              Join ProLearning today and unlock a smarter way to achieve your
              goals.
            </p>
            <div className="mt-10">
              <Button
                asChild
                size="lg"
                className="group rounded-2xl bg-white px-8 py-4 text-lg font-bold text-green-600 shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gray-100"
              >
                <Link to="/auth/register">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTA;