import { Zap } from 'lucide-react';

const Technology = () => (
    <section className="bg-green-50/50 py-20 dark:bg-gray-900/50">
        <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2">
            <div className="flex justify-center md:order-2">
                <Zap className="h-48 w-48 text-green-500" />
            </div>
            <div className="space-y-6 md:order-1">
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    Building the Future, Responsibly.
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                    Our technology is more than just code; it's a reflection of our values. We are committed to the ethical and responsible development of artificial intelligence, designed to foster critical thinking and create a supportive learning environment.
                </p>
            </div>
        </div>
    </section>
);

export default Technology;