import { motion } from 'framer-motion';
import { Bot, UserCheck, ArrowRight, Sparkles, CheckCircle, Zap, Award, Target, TrendingUp } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const ValueProposition: React.FC = () => {
  const stats = [
    { icon: Target, value: "95%", label: "Success Rate", description: "Students achieve their learning goals" },
    { icon: TrendingUp, value: "10x", label: "Faster Learning", description: "Compared to traditional methods" },
    { icon: Award, value: "50K+", label: "Graduates", description: "Successful course completions" },
    { icon: Sparkles, value: "AI-Powered", label: "Technology", description: "Advanced learning algorithms" }
  ];

  return (
    <section className="w-full bg-gradient-to-br from-gray-50 via-white to-green-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-green-950/20 py-20 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-20 text-center"
        >
          <Badge className="mb-6 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            The Perfect Learning Combination
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl mb-6">
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              AI Power,
            </span>{' '}
            <span className="block mt-2">Human Excellence.</span>
          </h2>
          <p className="mx-auto max-w-4xl text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Experience the revolutionary fusion of artificial intelligence and human expertise.
            Get personalized, adaptive learning that scales with your ambitions while maintaining
            the quality and depth that only expert educators can provide.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">{stat.label}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{stat.description}</div>
            </div>
          ))}
        </motion.div>

        {/* Main Value Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          {/* AI-Generated Courses Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mr-4">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">AI-Generated Courses</h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium">Infinite Possibilities</p>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                  Experience the future of education with our advanced AI that instantly creates
                  comprehensive, personalized courses on virtually any subject you can imagine.
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    'Personalized Learning Paths',
                    'Unlimited Subject Coverage',
                    'Instant Course Creation',
                    'Adaptive Content Difficulty',
                    'Real-time Progress Tracking'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl">
                  <Link to="/instruct/courses/new">
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Course Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Expert-Crafted Courses Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="h-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800 hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mr-4">
                    <UserCheck className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Expert-Crafted Courses</h3>
                    <p className="text-green-600 dark:text-green-400 font-medium">Premium Quality</p>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                  Learn from the best with our curated library of courses meticulously designed
                  by leading educators, industry professionals, and subject matter experts.
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    'Expert-Verified Content',
                    'Structured Learning Paths',
                    'Industry Best Practices',
                    'Professional Certifications',
                    'Mentorship Opportunities'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button asChild className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-2xl">
                  <Link to="/marketplace">
                    <Award className="w-4 h-4 mr-2" />
                    Browse Expert Courses
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 text-center"
        >
          <Card className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white border-0">
            <CardContent className="p-12">
              <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Learning?</h3>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Join thousands of learners who are already experiencing the perfect blend of AI innovation and human expertise.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-green-600 hover:bg-gray-100 rounded-2xl">
                  <Link to="/auth/register">
                    Start Learning Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-2xl">
                  <Link to="/features">
                    Explore Features
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default ValueProposition;