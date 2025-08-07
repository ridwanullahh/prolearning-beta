import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  Brain,
  BookOpen,
  Target,
  Sparkles,
  Clock,
  CheckCircle,
  Globe,
  Lightbulb
} from 'lucide-react';
import React from 'react';

const AiCourseGeneration = () => {
  const subFeatures = [
    {
      icon: Brain,
      title: "Intelligent Content Creation",
      description: "AI analyzes your topic and creates structured, comprehensive course content with proper learning progression.",
      features: ["Auto-generated lesson plans", "Contextual content creation", "Learning objective alignment"]
    },
    {
      icon: Target,
      title: "Curriculum Customization",
      description: "Tailor courses to specific educational standards, difficulty levels, and learning preferences.",
      features: ["Global curriculum standards", "Adaptive difficulty levels", "Personalized learning paths"]
    },
    {
      icon: Sparkles,
      title: "Multi-Format Content",
      description: "Generate diverse content types including text, quizzes, flashcards, and interactive elements.",
      features: ["Rich text lessons", "Interactive quizzes", "Visual mind maps", "Practice exercises"]
    },
    {
      icon: Clock,
      title: "Instant Generation",
      description: "Create complete courses in minutes, not weeks. Perfect for rapid prototyping and content creation.",
      features: ["Real-time generation", "Streaming content display", "Quick iterations"]
    }
  ];

  return (
    <section
      id="ai-course-generation"
      className="w-full bg-white py-20 dark:bg-gray-950 md:py-24 lg:py-32"
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Main Feature Section */}
        <div className="grid grid-cols-1 items-center gap-12 mb-20 md:grid-cols-2 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex justify-center"
          >
            <div className="relative h-64 w-64">
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 50,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <Zap className="h-full w-full text-green-200/50 dark:text-green-800/50" />
              </motion.div>
              <Zap className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 text-green-500" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-gray-800 dark:text-green-400">
                <Zap className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                AI Course Generation
              </h2>
            </div>
            <p className="max-w-xl text-lg text-gray-600 dark:text-gray-300">
              Instantly create comprehensive courses on any subject, complete with
              lessons, quizzes, and practical exercises. Our AI does the heavy
              lifting, so you can focus on learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="group rounded-2xl">
                <Link to="/instruct/courses/new">
                  Generate a Course Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-2xl"
                onClick={() => {
                  document.getElementById('ai-generation-details')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Detailed Sub-Features Section */}
        <motion.div
          id="ai-generation-details"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-12"
        >
          <div className="text-center">
            <Badge className="mb-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              AI-Powered Features
            </Badge>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Advanced AI Capabilities
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our AI course generation system combines cutting-edge technology with educational expertise
              to create personalized, engaging, and effective learning experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {subFeatures.map((feature, index) => (
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
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {feature.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {feature.features.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {item}
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
            className="text-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl p-8"
          >
            <Lightbulb className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Experience AI-Powered Course Creation?
            </h4>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of educators and learners who are already using our AI to create
              engaging, comprehensive courses in minutes.
            </p>
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 rounded-2xl">
              <Link to="/instruct/courses/new">
                Start Creating Now
                <Sparkles className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AiCourseGeneration;