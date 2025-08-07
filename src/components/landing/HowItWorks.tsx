import { motion } from 'framer-motion';
import { Compass, BookOpen, BarChart, ArrowRight, Play, Zap, Target, CheckCircle, Sparkles, Brain } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Compass,
      number: 1,
      title: "Discover Your Path",
      description: "Choose from thousands of expert-crafted courses or let our AI instantly generate a personalized course on any topic you can imagine.",
      features: ["Browse 10K+ courses", "AI course generation", "Personalized recommendations", "Expert-verified content"],
      color: "from-blue-500 to-indigo-500",
      bgColor: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30"
    },
    {
      icon: BookOpen,
      number: 2,
      title: "Engage & Master",
      description: "Immerse yourself in interactive lessons with our comprehensive learning toolkit. From quizzes to mind maps, every tool is designed for maximum retention.",
      features: ["Interactive lessons", "Smart flashcards", "Visual mind maps", "Adaptive quizzes"],
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30"
    },
    {
      icon: BarChart,
      number: 3,
      title: "Track & Achieve",
      description: "Monitor your progress with detailed analytics and insights. Celebrate milestones and identify areas for improvement with our intelligent tracking system.",
      features: ["Real-time progress", "Performance analytics", "Achievement badges", "Learning insights"],
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30"
    }
  ];

  return (
    <section className="w-full bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30 dark:from-gray-950 dark:via-green-950/20 dark:to-emerald-950/20 py-20 md:py-24 lg:py-32">
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
            <Target className="w-4 h-4 mr-2" />
            Simple & Effective Process
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl mb-6">
            Your Learning Journey
            <span className="block bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mt-2">
              Made Simple
            </span>
          </h2>
          <p className="mx-auto max-w-4xl text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Experience a revolutionary learning platform designed for the modern learner.
            From discovery to mastery, every step is optimized for your success.
          </p>
        </motion.div>

        {/* Steps Section */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connection Line */}
          <div className="hidden lg:block absolute left-1/2 top-32 bottom-32 w-1 bg-gradient-to-b from-green-200 via-emerald-200 to-teal-200 dark:from-green-800/50 dark:via-emerald-800/50 dark:to-teal-800/50 transform -translate-x-1/2 z-0" />

          <div className="space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`relative grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}
              >
                {/* Step Number Circle */}
                <div className="hidden lg:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>
                </div>

                {/* Content */}
                <div className={`${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <Card className={`bg-gradient-to-br ${step.bgColor} border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300`}>
                    <CardContent className="p-8">
                      <div className="flex items-center mb-6 lg:hidden">
                        <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mr-4`}>
                          <step.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className={`w-8 h-8 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center`}>
                          <span className="text-sm font-bold text-white">{step.number}</span>
                        </div>
                      </div>

                      <div className="hidden lg:flex items-center mb-6">
                        <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center`}>
                          <step.icon className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                        {step.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        {step.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Visual Element */}
                <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''} flex justify-center`}>
                  <div className="relative">
                    <div className={`w-64 h-64 bg-gradient-to-br ${step.color} rounded-full opacity-20 blur-3xl`} />
                    <div className={`absolute inset-0 w-64 h-64 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center`}>
                      <step.icon className="w-24 h-24 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <Card className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white border-0 max-w-4xl mx-auto">
            <CardContent className="p-12">
              <Brain className="w-16 h-16 mx-auto mb-6 text-green-100" />
              <h3 className="text-3xl font-bold mb-4">Ready to Start Your Learning Adventure?</h3>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Join over 50,000 learners who have transformed their knowledge and skills with our innovative platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-green-600 hover:bg-gray-100 rounded-2xl">
                  <Link to="/auth/register">
                    <Play className="w-5 h-5 mr-2" />
                    Start Learning Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-2xl">
                  <Link to="/marketplace">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Explore Courses
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

export default HowItWorks;


