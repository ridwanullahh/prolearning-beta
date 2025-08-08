import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const JoinMovement = () => (
    <section className="bg-green-50/50 py-20 text-center dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
                Be Part of the Learning Revolution.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                Whether you are taking your first academic steps or are a lifelong learner seeking to expand your horizons, you have a place here.
            </p>
            <div className="mt-10">
                <Button asChild size="lg" className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
                    <Link to="/auth/register">
                        Start Your Learning Journey
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </div>
    </section>
);

export default JoinMovement;