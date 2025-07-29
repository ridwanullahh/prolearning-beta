import { Heart, CheckCircle } from 'lucide-react';

const Philosophy = () => (
  <section className="py-20">
    <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2">
      <div className="space-y-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Human Intellect, Amplified by Intelligent Technology.
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Our entire platform is built upon a core philosophy of synergy. We
          believe the most powerful educational experiences lie at the
          intersection of two worlds:
        </p>
        <ul className="space-y-4">
          <ListItem title="The Depth of Human Expertise">
            We honor the irreplaceable value of human teachers. The nuance,
            wisdom, and structured pedagogy that come from years of experience
            are the bedrock of true mastery.
          </ListItem>
          <ListItem title="Intelligent, Adaptive Learning">
            We embrace cutting-edge technology to make learning dynamic and
            responsive. Our platform's intelligence works as a personal guide
            for each learner.
          </ListItem>
        </ul>
      </div>
      <div className="flex justify-center">
        <Heart className="h-48 w-48 text-green-500" />
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

export default Philosophy;