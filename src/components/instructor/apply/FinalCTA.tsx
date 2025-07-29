import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FinalCTA = () => (
  <section className="py-20 text-center">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-6xl">
        Ready to Elevate Your Impact?
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
        If you are passionate about sharing your knowledge and are ready to
        join the next evolution of education, we invite you to apply.
      </p>
      <div className="mt-10">
        <Button asChild size="lg" className="rounded-2xl">
          <Link to="/apply">Start Your Application</Link>
        </Button>
      </div>
    </div>
  </section>
);

export default FinalCTA;