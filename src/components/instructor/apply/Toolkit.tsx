import { Briefcase, Share, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Toolkit = () => (
  <section className="py-20">
    <div className="container mx-auto px-4 text-center">
      <h2 className="mb-12 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        The Tools to Build Your{' '}
        <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
          Vision.
        </span>
      </h2>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
        <Feature
          icon={Briefcase}
          title="Intuitive Course Builder"
          description="Structure your lessons, upload your content, and design your curriculum with our easy-to-use interface."
        />
        <Feature
          icon={Share}
          title="AI-Assistant for Content"
          description="Use our AI to help generate quiz questions, flashcard sets, and summaries based on your core lesson content."
        />
        <Feature
          icon={BarChart3}
          title="Learner Analytics"
          description="Gain meaningful insights into how your students are progressing and interacting with your course."
        />
      </div>
        <div className="mt-12">
            <Button asChild size="lg" variant="outline" className="group rounded-2xl">
                <Link to="/features">
                    Explore All Features
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

export default Toolkit;