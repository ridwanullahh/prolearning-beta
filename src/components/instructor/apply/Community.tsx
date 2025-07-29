import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Community = () => (
  <section className="py-20">
    <div className="container mx-auto px-4 text-center">
      <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        Become Part of a Community of{' '}
        <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
          Innovators.
        </span>
      </h2>
      <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300">
        When you join ProLearning, you're not just getting access to a platform;
        you're joining a curated community of fellow experts, educators, and
        innovators.
      </p>
      <div className="mt-10">
        <Button asChild size="lg" variant="outline" className="group rounded-2xl">
          <Link to="/community">
            Explore Our Community
            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  </section>
);

export default Community;