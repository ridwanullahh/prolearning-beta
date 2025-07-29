import { TrendingUp, Briefcase, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const WhyProLearning = () => (
  <section className="py-20">
    <div className="container mx-auto px-4 text-center">
      <h2 className="mb-12 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        A Platform as Serious About{' '}
        <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
          Education as You Are.
        </span>
      </h2>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
        <Feature
          icon={TrendingUp}
          title="Amplify Your Impact"
          description="Your knowledge is valuable. We help you scale it. Create meticulously crafted courses that will enlighten and empower learners across the globe."
        />
        <Feature
          icon={Briefcase}
          title="Harness Advanced Technology"
          description="Gain access to a suite of AI-powered tools designed to augment your teaching, freeing you to focus on what you do best: teaching."
        />
        <Feature
          icon={Award}
          title="Build Your Legacy"
          description="Become a recognized thought leader on a platform dedicated to quality. We provide the stage and the audience; you provide the expertise."
        />
      </div>
      <div className="mt-12">
        <Button asChild size="lg" className="group rounded-2xl">
            <Link to="/about">
                Learn More About Our Mission
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

export default WhyProLearning;