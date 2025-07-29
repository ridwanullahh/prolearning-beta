import { Users, TrendingUp, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const GrowthPartnership = () => (
  <section className="bg-green-50/50 py-20 dark:bg-gray-900/50">
    <div className="container mx-auto px-4 text-center">
      <h2 className="mb-12 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        We Invest in Your{' '}
        <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
          Success.
        </span>
      </h2>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
        <Feature
          icon={Users}
          title="Dedicated Support"
          description="Receive guidance from our team of instructional designers and technical experts to ensure your course is engaging and effective."
        />
        <Feature
          icon={TrendingUp}
          title="Marketing & Promotion"
          description="We actively promote our platform and its premier courses to a global audience, bringing motivated learners directly to you."
        />
        <Feature
          icon={Award}
          title="Continuous Innovation"
          description="Benefit from our commitment to platform improvement. As we roll out new features and tools, you'll be the first to access them."
        />
      </div>
        <div className="mt-12">
            <Button asChild size="lg" className="group rounded-2xl">
                <Link to="/about">
                    More About Our Partnership
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            </Button>
        </div>
    </div>
  </section>
);

const Feature = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-gray-800 dark:text-green-400">
      <Icon className="h-8 w-8" />
    </div>
    <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </div>
);

export default GrowthPartnership;