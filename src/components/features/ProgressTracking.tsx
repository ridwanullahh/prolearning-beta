import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  TrendingUp,
  Target,
  CheckCircle,
  Star,
  Award,
  Zap,
  Calendar,
  Heart,
  BookOpen,
  Clock
} from 'lucide-react';
import React from 'react';

const ProgressTracking = () => {
  const trackingFeatures = [
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Comprehensive analytics dashboard showing your learning patterns, strengths, and areas for improvement.",
      features: ["Learning velocity", "Skill progression", "Time analytics", "Performance insights"]
    },
    {
      icon: Target,
      title: "Goal Setting & Tracking",
      description: "Set personalized learning goals and track your progress with intelligent milestone tracking.",
      features: ["Custom goals", "Milestone tracking", "Progress visualization", "Achievement rewards"]
    },
    {
      icon: TrendingUp,
      title: "Performance Insights",
      description: "AI-powered insights that help you understand your learning patterns and optimize your study approach.",
      features: ["Learning patterns", "Optimization tips", "Weakness identification", "Strength analysis"]
    },
    {
      icon: Calendar,
      title: "Study Schedule Optimization",
      description: "Smart scheduling recommendations based on your progress and learning preferences.",
      features: ["Optimal study times", "Break recommendations", "Workload balancing", "Deadline management"]
    }
  ];

  const stats = [
    { icon: TrendingUp, value: "85%", label: "Completion Rate", description: "Average course completion" },
    { icon: Clock, value: "2.5x", label: "Faster Learning", description: "With progress tracking" },
    { icon: Award, value: "92%", label: "Goal Achievement", description: "Users reach their goals" }
  ];

  return (
    <section
      id="progress-tracking"
      className="w-full bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-gray-950 dark:via-purple-950/20 dark:to-pink-950/20 py-20 md:py-24 lg:py-32"
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Main Content */}
        <div className="grid grid-cols-1 items-center gap-12 mb-20 lg:grid-cols-2 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex justify-center lg:order-2"
          >
            <div className="relative h-80 w-80">
              <motion.div
                className="absolute inset-0"
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
              >
                <BarChart3 className="h-full w-full text-purple-200/40 dark:text-purple-800/40" />
              </motion.div>
              <motion.div
                className="absolute inset-0"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
              >
                <TrendingUp className="h-full w-full scale-75 transform text-pink-200/40 dark:text-pink-800/40" />
              </motion.div>
              <BarChart3 className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 text-purple-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-6 lg:order-1"
          >
            <Badge className="mb-6 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-4 py-2">
              <BarChart3 className="w-4 h-4 mr-2" />
              Progress Analytics
            </Badge>

            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl mb-6">
              Track Your{' '}
              <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mt-2">
                Learning Progress
              </span>
            </h2>

            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              Detailed analytics and progress tracking to help you stay motivated and achieve your learning goals.
              Visualize your journey to success with comprehensive insights and personalized recommendations.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">{stat.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{stat.description}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Link to="/dashboard">
                  <BookOpen className="w-5 h-5 mr-2" />
                  View Your Progress
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-2xl"
                onClick={() => {
                  document.getElementById('tracking-details')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Detailed Features Section */}
        <motion.div
          id="tracking-details"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-12"
        >
          <div className="text-center">
            <Badge className="mb-4 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
              Analytics Features
            </Badge>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Progress Analytics
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our advanced analytics system provides detailed insights into your learning journey,
              helping you optimize your study approach and achieve your goals faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trackingFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-white" />
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
            className="text-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8"
          >
            <Heart className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Start Tracking Your Success
            </h4>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of learners who use our progress tracking to achieve their goals faster
              and stay motivated throughout their learning journey.
            </p>
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 rounded-2xl">
              <Link to="/auth/register">
                <Zap className="h-5 w-5 mr-2" />
                Get Started Today
                <Star className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProgressTracking;