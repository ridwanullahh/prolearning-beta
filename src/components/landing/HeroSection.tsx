import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  Users,
  Star,
  Play,
  Brain,
  Zap,
  Target,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

const HeroSection = () => {
  const stats = [
    { icon: Users, value: "50K+", label: "Active Learners" },
    { icon: BookOpen, value: "10K+", label: "Courses Available" },
    { icon: Star, value: "4.9", label: "Average Rating" },
    { icon: TrendingUp, value: "95%", label: "Success Rate" }
  ];

  const features = [
    "AI Course Generation",
    "Expert-Led Courses",
    "Interactive Learning Tools",
    "Personalized Pathways"
  ];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-8 text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Complete Learning Ecosystem
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              <span className="block mb-2">Where Learning</span>
              <span className="block bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Meets Innovation
              </span>
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-2 text-gray-700 dark:text-gray-300">
                AI + Expert Instruction
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300 lg:mx-0 leading-relaxed"
            >
              Choose your learning path: Explore thousands of expert-crafted courses from professional instructors,
              or instantly generate custom courses on any topic with our advanced AI. From structured learning
              programs to on-demand knowledge creation - your education, your way.
            </motion.p>

            {/* Feature List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Button
                asChild
                size="lg"
                className="group w-full sm:w-auto rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-green-500/25"
              >
                <Link to="/auth/register">
                  <Play className="mr-2 h-5 w-5" />
                  Start Learning Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="group w-full sm:w-auto rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-200 shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:border-green-400 dark:hover:border-green-500 hover:bg-white dark:hover:bg-gray-800"
              >
                <Link to="/marketplace">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore Courses
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-gray-200 dark:border-gray-700"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <div className="relative hidden lg:flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="relative w-full max-w-lg"
            >
              {/* Main Circle */}
              <div className="relative w-96 h-96 mx-auto">
                {/* Background Glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/30 to-emerald-400/30 blur-3xl"></div>

                {/* Rotating Ring */}
                <motion.div
                  className="absolute inset-8 rounded-full border-4 border-dashed border-green-400/40"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                />

                {/* Inner Circle */}
                <motion.div
                  className="absolute inset-16 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-2xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
                />

                {/* Center Icon */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="relative">
                    <Brain className="h-24 w-24 text-green-600 dark:text-green-400" />
                    <motion.div
                      className="absolute -top-2 -right-2"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Zap className="h-8 w-8 text-yellow-500" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Floating Elements */}
                {[
                  { icon: BookOpen, position: "top-4 left-4", delay: 1 },
                  { icon: Target, position: "top-4 right-4", delay: 1.2 },
                  { icon: Users, position: "bottom-4 left-4", delay: 1.4 },
                  { icon: Star, position: "bottom-4 right-4", delay: 1.6 }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: item.delay }}
                    className={`absolute ${item.position} w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center`}
                  >
                    <item.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;