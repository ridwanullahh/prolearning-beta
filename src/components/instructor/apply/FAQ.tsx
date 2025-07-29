import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const FAQ = () => (
  <section className="bg-green-50/50 py-20 dark:bg-gray-900/50">
    <div className="container mx-auto px-4">
      <h2 className="mb-12 text-center text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        Your Questions,{' '}
        <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
          Answered.
        </span>
      </h2>
      <div className="mx-auto max-w-3xl space-y-8">
        <FAQItem question="Who owns the content I create?">
          You do. You retain full ownership of your intellectual property. You
          simply grant us a license to host and distribute it on the ProLearning
          platform.
        </FAQItem>
        <FAQItem question="Is there a cost to become an instructor?">
          No. Applying and becoming an instructor is completely free.
        </FAQItem>
        <FAQItem question="How and when do I get paid?">
          Payments are made monthly via direct deposit or your preferred
          payment gateway. You can track all earnings transparently in your
          dashboard.
        </FAQItem>
      </div>
        <div className="mt-12 text-center">
            <Button asChild size="lg" variant="outline" className="group rounded-2xl">
                <Link to="/contact">
                    Have More Questions?
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            </Button>
        </div>
    </div>
  </section>
);

const FAQItem = ({ question, children }) => (
  <div>
    <h4 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
      {question}
    </h4>
    <p className="text-gray-600 dark:text-gray-300">{children}</p>
  </div>
);

export default FAQ;