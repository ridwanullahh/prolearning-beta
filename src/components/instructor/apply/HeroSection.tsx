import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => (
  <section className="bg-green-50/50 py-20 text-center dark:bg-gray-900/50">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="container mx-auto px-4"
    >
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
        Share Your Expertise.
        <br />
        <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
          Shape the Future of Learning.
        </span>
      </h1>
      <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
        You are more than an expert; you are a guide. ProLearning invites a
        select group of passionate educators, industry leaders, and seasoned
        practitioners to partner with us.
      </p>
      <div className="mt-10">
        <Button asChild size="lg" className="rounded-2xl">
          <Link to="/apply">Apply to Join Our Experts</Link>
        </Button>
      </div>
    </motion.div>
  </section>
);

export default HeroSection;