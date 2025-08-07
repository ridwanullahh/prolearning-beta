import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BrainCircuit,
  FileText,
  HelpCircle,
  Zap,
  BarChart3,
  MessageSquare,
  BookOpen,
  CheckCircle,
  Lightbulb,
  Target,
  Brain
} from 'lucide-react';
import React from 'react';

const SmartLearningTools = () => {
  const learningTools = [
    {
      icon: HelpCircle,
      title: "Interactive Quizzes",
      description: "AI-generated quizzes that adapt to your learning progress and identify knowledge gaps.",
      features: ["Adaptive difficulty", "Instant feedback", "Performance analytics", "Multiple question types"]
    },
    {
      icon: FileText,
      title: "Smart Flashcards",
      description: "Intelligent flashcard system with spaced repetition algorithms for optimal memory retention.",
      features: ["Spaced repetition", "Progress tracking", "Custom categories", "Mobile-friendly"]
    },
    {
      icon: Brain,
      title: "Visual Mind Maps",
      description: "Interactive mind maps that help visualize complex concepts and their relationships.",
      features: ["Concept visualization", "Interactive exploration", "Knowledge connections", "Export options"]
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Comprehensive analytics dashboard to track your learning journey and achievements.",
      features: ["Learning metrics", "Goal tracking", "Performance insights", "Achievement badges"]
    }
  ];

  return (
    <section
      id="smart-learning-tools"
      className="w-full bg-green-50/30 py-20 dark:bg-gray-900/30 md:py-24 lg:py-32"
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Main Feature Section */}
        <div className="grid grid-cols-1 items-center gap-12 mb-20 md:grid-cols-2 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex justify-center md:order-2"
          >
            <div className="relative h-64 w-64">
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: -360 }}
                transition={{
                  duration: 60,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <BrainCircuit className="h-full w-full text-green-200/50 dark:text-green-800/50" />
              </motion.div>
              <BrainCircuit className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 text-green-500" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-6 md:order-1"
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-gray-800 dark:text-green-400">
                <BrainCircuit className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Smart Learning Tools
              </h2>
            </div>
            <p className="max-w-xl text-lg text-gray-600 dark:text-gray-300">
              From interactive flashcards to AI-driven study planners, we make
              learning more efficient and engaging. Our tools adapt to your
              learning style for a truly personalized experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="group rounded-2xl">
                <Link to="/dashboard">
                  Explore Learning Tools
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-2xl"
                onClick={() => {
                  document.getElementById('learning-tools-details')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Detailed Learning Tools Section */}
        <motion.div
          id="learning-tools-details"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-12"
        >
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Learning Enhancement
            </Badge>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Learning Tools
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our comprehensive suite of learning tools is designed to enhance retention,
              engagement, and understanding through proven educational methodologies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {learningTools.map((tool, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <tool.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {tool.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {tool.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-8"
          >
            <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Supercharge Your Learning Experience
            </h4>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Access all these powerful learning tools and more. Start your journey
              towards more effective and engaging learning today.
            </p>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 rounded-2xl">
              <Link to="/dashboard">
                Start Learning Now
                <Zap className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default SmartLearningTools;