import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const PartnershipPath = () => (
  <section className="bg-green-50/50 py-20 dark:bg-gray-900/50">
    <div className="container mx-auto px-4 text-center">
      <h2 className="mb-12 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        A Straightforward and{' '}
        <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
          Collaborative Process.
        </span>
      </h2>
      <div className="relative">
        <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-16">
          <Step
            step={1}
            title="Apply Now"
            description="Submit your application through our private portal. Tell us about your area of expertise and your vision for teaching."
            isReversed={false}
          />
          <Step
            step={2}
            title="Get Reviewed"
            description="Our curation team, composed of academic and instructional design professionals, will carefully review your submission."
            isReversed={true}
          />
          <Step
            step={3}
            title="Onboard with Us"
            description="If selected, you will be invited to our exclusive onboarding process, where you'll learn how to leverage our platform and tools."
            isReversed={false}
          />
          <Step
            step={4}
            title="Create & Inspire"
            description="Begin crafting your courses and inspiring learners around the world. Our team will be available to support you at every step."
            isReversed={true}
          />
        </div>
        <div className="mt-20">
            <Button asChild size="lg" className="group rounded-2xl">
                <Link to="/apply">
                    Start Your Application
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            </Button>
        </div>
      </div>
    </div>
  </section>
);

const Step = ({ step, title, description, isReversed }) => (
  <div
    className={`relative flex items-center ${isReversed ? 'flex-row-reverse' : ''}`}
  >
    <div className="relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
      <span className="text-2xl font-bold">{step}</span>
    </div>
    <div
      className={`w-full rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800 ${isReversed ? 'mr-8' : 'ml-8'}`}
    >
      <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  </div>
);

export default PartnershipPath;