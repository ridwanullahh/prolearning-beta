import { DollarSign, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Monetize = () => (
  <section className="bg-green-50/50 py-20 dark:bg-gray-900/50">
    <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2">
      <div>
        <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Earn Revenue from Every{' '}
          <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
            Enrollment.
          </span>
        </h2>
        <ul className="space-y-4">
          <ListItem title="Generous Revenue Sharing">
            Receive a competitive share of the revenue for every student who
            enrolls in your course.
          </ListItem>
          <ListItem title="Transparent Reporting">
            Track your earnings and student enrollment numbers in real-time
            through your personal instructor dashboard.
          </ListItem>
          <ListItem title="Focus on Creating, Not Selling">
            We handle the marketing, payment processing, and platform
            maintenance so you can dedicate your energy to creating exceptional
            learning content.
          </ListItem>
        </ul>
        <div className="mt-8">
            <Button asChild size="lg" className="group rounded-2xl">
                <Link to="/pricing">
                    View Our Pricing
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            </Button>
        </div>
      </div>
      <div className="flex justify-center">
        <DollarSign className="h-48 w-48 text-green-500" />
      </div>
    </div>
  </section>
);

const ListItem = ({ title, children }) => (
  <li className="flex">
    <CheckCircle className="mr-4 mt-1 h-6 w-6 flex-shrink-0 text-green-500" />
    <div>
      <h4 className="font-bold text-gray-900 dark:text-white">{title}</h4>
      <p className="text-gray-600 dark:text-gray-300">{children}</p>
    </div>
  </li>
);

export default Monetize;