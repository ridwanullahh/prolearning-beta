import { motion } from 'framer-motion';
import {
  CheckSquare,
  Copy,
  GitBranch,
  List,
  FileText,
  Sparkles,
  ArrowRight,
  Brain,
  Zap,
  Target,
  BookOpen,
  Award,
  TrendingUp,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const Toolkit: React.FC = () => {
  const tools = [
    {
      icon: CheckSquare,
      title: "Interactive Quizzes",
      description: "Adaptive assessments that identify knowledge gaps and provide personalized feedback for continuous improvement.",
      features: ["Adaptive difficulty", "Instant feedback", "Progress tracking", "Performance analytics"],
      color: "from-blue-500 to-indigo-500",
      bgColor: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30"
    },
    {
      icon: Copy,
      title: "Smart Flashcards",
      description: "AI-powered spaced repetition system that optimizes memory retention using proven cognitive science principles.",
      features: ["Spaced repetition", "Memory optimization", "Auto-scheduling", "Retention analytics"],
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30"
    },
    {
      icon: GitBranch,
      title: "Visual Mind Maps",
      description: "Automatically generated mind maps that reveal connections between concepts and enhance visual learning.",
      features: ["Auto-generation", "Visual connections", "Concept mapping", "Export options"],
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30"
    },
    {
      icon: List,
      title: "Smart Keynotes",
      description: "AI-extracted key points and essential facts organized for efficient review and rapid knowledge reinforcement.",
      features: ["Key point extraction", "Organized summaries", "Quick review", "Highlight important facts"],
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30"
    },
    {
      icon: FileText,
      title: "AI Summaries",
      description: "Intelligent, context-aware summaries that capture the essence of complex topics in digestible formats.",
      features: ["Context-aware", "Intelligent extraction", "Multiple formats", "Customizable length"],
      color: "from-teal-500 to-cyan-500",
      bgColor: "from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30"
    },
    {
      icon: Brain,
      title: "Learning Analytics",
      description: "Comprehensive insights into your learning patterns, strengths, and areas for improvement.",
      features: ["Learning patterns", "Strength analysis", "Progress insights", "Personalized recommendations"],
      color: "from-indigo-500 to-purple-500",
      bgColor: "from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30"
    }
  ];

  const stats = [
    { icon: Target, value: "95%", label: "Retention Rate", description: "Students retain knowledge longer" },
    { icon: Zap, value: "3x", label: "Faster Learning", description: "Compared to traditional methods" },
    { icon: TrendingUp, value: "89%", label: "Improved Scores", description: "Average test score improvement" },
    { icon: Award, value: "4.9/5", label: "User Rating", description: "Student satisfaction score" }
  ];

  return (
    <section className="w-full bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 dark:from-gray-950 dark:via-green-950/20 dark:to-emerald-950/20 py-20 md:py-24 lg:py-32">
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
            <BookOpen className="w-4 h-4 mr-2" />
            Complete Learning Toolkit
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl mb-6">
            A Complete Toolkit for{' '}
            <span className="block bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mt-2">
              Deeper Understanding
            </span>
          </h2>
          <p className="mx-auto max-w-4xl text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Every lesson on ProLearning is a complete learning ecosystem designed to help you
            absorb, retain, and apply knowledge effectively through cutting-edge learning tools.
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
        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {tools.map((tool, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Card className={`h-full bg-gradient-to-br ${tool.bgColor} border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300`}>
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${tool.color} rounded-3xl flex items-center justify-center`}>
                      <tool.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {tool.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                    {tool.description}
                  </p>

                  <div className="space-y-3">
                    {tool.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <CheckSquare className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
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
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white border-0 max-w-4xl mx-auto">
            <CardContent className="p-12">
              <Sparkles className="w-16 h-16 mx-auto mb-6 text-green-100" />
              <h3 className="text-3xl font-bold mb-4">Ready to Experience the Complete Toolkit?</h3>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Join thousands of learners who are already using our comprehensive toolkit to
                accelerate their learning and achieve their goals faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-green-600 hover:bg-gray-100 rounded-2xl">
                  <Link to="/auth/register">
                    <Zap className="w-5 h-5 mr-2" />
                    Start Learning Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-2xl">
                  <Link to="/features">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Explore All Features
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

export default Toolkit;