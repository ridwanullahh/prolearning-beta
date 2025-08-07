import { motion } from 'framer-motion';
import {
  Baby,
  School,
  Library,
  Beaker,
  User,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Heart,
  Zap,
  Users,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const ForEveryLearner: React.FC = () => {
  const learningStages = [
    {
      icon: Baby,
      title: "Early Childhood",
      description: "Spark curiosity with fun, foundational modules designed for young minds.",
      features: ["Interactive games", "Visual learning", "Parent guidance", "Safe environment"],
      color: "from-pink-500 to-rose-500",
      bgColor: "from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30",
      ageRange: "3-6 years"
    },
    {
      icon: School,
      title: "Primary & Secondary",
      description: "Ace exams and build a strong academic foundation with curriculum-aligned content.",
      features: ["Curriculum aligned", "Exam preparation", "Progress tracking", "Homework help"],
      color: "from-blue-500 to-indigo-500",
      bgColor: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
      ageRange: "6-18 years"
    },
    {
      icon: Library,
      title: "University & College",
      description: "Dive deep into your field of study, from research methodologies to advanced concepts.",
      features: ["Research tools", "Advanced topics", "Peer collaboration", "Academic writing"],
      color: "from-purple-500 to-violet-500",
      bgColor: "from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30",
      ageRange: "18-25 years"
    },
    {
      icon: Beaker,
      title: "Postgraduate",
      description: "Access specialized knowledge and cutting-edge research in your field of expertise.",
      features: ["Specialized content", "Research methods", "Industry insights", "Expert mentorship"],
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
      ageRange: "25+ years"
    },
    {
      icon: Briefcase,
      title: "Professional Development",
      description: "Advance your career with industry-relevant skills and professional certifications.",
      features: ["Career advancement", "Industry skills", "Certifications", "Networking"],
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30",
      ageRange: "All ages"
    },
    {
      icon: User,
      title: "Lifelong Learners",
      description: "Pick up a new skill, explore a passion, or stay mentally sharp throughout life.",
      features: ["Personal interests", "Hobby learning", "Mental fitness", "Social learning"],
      color: "from-teal-500 to-cyan-500",
      bgColor: "from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30",
      ageRange: "All ages"
    }
  ];

  const stats = [
    { icon: Users, value: "2M+", label: "Active Learners", description: "Across all age groups" },
    { icon: TrendingUp, value: "94%", label: "Success Rate", description: "Students achieve their goals" },
    { icon: Award, value: "500K+", label: "Certificates", description: "Issued to learners" }
  ];

  return (
    <section className="w-full bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-gray-950 dark:via-purple-950/20 dark:to-pink-950/20 py-20 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-20 text-center"
        >
          <Badge className="mb-6 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-4 py-2">
            <Heart className="w-4 h-4 mr-2" />
            Lifelong Learning Journey
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl mb-6">
            Learning for Every{' '}
            <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mt-2">
              Stage of Life.
            </span>
          </h2>
          <p className="mx-auto max-w-4xl text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Knowledge has no age limit. ProLearning is designed to be your lifelong learning companion,
            adapting to your needs as you grow and evolve throughout your educational journey.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-3 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">{stat.label}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{stat.description}</div>
            </div>
          ))}
        </motion.div>
        {/* Learning Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {learningStages.map((stage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Card className={`h-full bg-gradient-to-br ${stage.bgColor} border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300`}>
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${stage.color} rounded-3xl flex items-center justify-center`}>
                      <stage.icon className="w-8 h-8 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stage.ageRange}
                    </Badge>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {stage.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                    {stage.description}
                  </p>

                  <div className="space-y-3">
                    {stage.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
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
          <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white border-0 max-w-4xl mx-auto">
            <CardContent className="p-12">
              <GraduationCap className="w-16 h-16 mx-auto mb-6 text-purple-100" />
              <h3 className="text-3xl font-bold mb-4">Ready to Start Your Learning Journey?</h3>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                No matter where you are in life, there's always something new to discover.
                Join our community of lifelong learners and unlock your potential.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-100 rounded-2xl">
                  <Link to="/auth/register">
                    <Zap className="w-5 h-5 mr-2" />
                    Find Your Learning Path
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-2xl">
                  <Link to="/marketplace">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Browse Courses
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

export default ForEveryLearner;