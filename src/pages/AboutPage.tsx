import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Rocket, Globe } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="bg-gray-50 dark:bg-gray-950">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">About ProLearning</h1>
                    <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        We are a passionate team of educators, technologists, and designers dedicated to revolutionizing the way people learn.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay:0.2}}>
                        <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80" alt="Team" className="rounded-2xl shadow-lg"/>
                    </motion.div>
                    <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay:0.4}} className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                <Rocket className="h-6 w-6 text-green-600 dark:text-green-400"/>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Our Mission</h3>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">To make personalized, high-quality education accessible to everyone, everywhere. We believe that learning should be an engaging and lifelong journey, and we're building the tools to make that a reality.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                <Target className="h-6 w-6 text-green-600 dark:text-green-400"/>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Our Vision</h3>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">To be the leading platform for AI-driven education, empowering learners and educators worldwide to achieve their full potential.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="text-center my-20">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Meet the Team</h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">A group of passionate individuals driving the future of learning.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <TeamMember name="Alice Johnson" role="Founder & CEO" />
                    <TeamMember name="Bob Williams" role="Lead Developer" />
                    <TeamMember name="Charlie Brown" role="Head of Curriculum" />
                    <TeamMember name="Diana Prince" role="UX/UI Designer" />
                </div>
            </div>
        </div>
    );
};

const TeamMember = ({ name, role }) => (
    <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once: true, amount: 0.5}} className="text-center">
        <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4"/>
        <h4 className="text-xl font-bold">{name}</h4>
        <p className="text-green-600">{role}</p>
    </motion.div>
);


export default AboutPage;