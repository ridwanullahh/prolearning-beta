import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Heart, Zap, Users } from 'lucide-react';

const WhoWeWant = () => (
  <section className="py-20 bg-white dark:bg-gray-950">
    <div className="container mx-auto px-4 text-center">
      <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
        Are You a{' '}
        <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
          Pioneer of Knowledge?
        </span>
      </h2>
      <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
        We are building a community founded on a shared passion for authentic,
        high-quality education. We are looking for partners who embody:
      </p>
      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        <Value
          icon={Star}
          title="Deep Expertise"
          description="You have proven, in-depth knowledge and real-world experience in your subject area."
        />
        <Value
          icon={Heart}
          title="A Passion for Teaching"
          description="You have a genuine desire to share your knowledge and a commitment to helping others succeed."
        />
        <Value
          icon={Zap}
          title="Commitment to Quality"
          description="You believe in going the extra mile to create learning experiences that are transformative."
        />
        <Value
          icon={Users}
          title="A Collaborative Spirit"
          description="You are excited by the prospect of blending your expertise with cutting-edge technology."
        />
      </div>
      <div className="mt-12">
        <Button asChild size="lg" variant="outline" className="group rounded-2xl">
            <Link to="/apply">
              Do You Have What It Takes?
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
        </Button>
      </div>
    </div>
  </section>
);

const Value = ({ icon: Icon, title, description }) => (
    <div className="group rounded-3xl bg-green-50/50 p-8 text-center transition-all duration-300 hover:bg-white hover:shadow-xl dark:bg-gray-800/50 dark:hover:bg-gray-800">
        <div className="mb-4 inline-block rounded-full bg-white p-4 shadow-md dark:bg-gray-700">
            <Icon className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
);

export default WhoWeWant;