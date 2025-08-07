import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Award,
  Users,
  CheckCircle,
  Star,
  BookOpen,
  Zap,
  TrendingUp,
  Globe,
  Heart
} from 'lucide-react';
import React from 'react';

const ExpertVerifiedContent = () => {
  const verificationFeatures = [
    {
      icon: Award,
      title: "Industry Expert Review",
      description: "Every course is reviewed by certified professionals with real-world experience in their field.",
      features: ["Professional certification", "Industry experience", "Peer validation", "Continuous updates"]
    },
    {
      icon: Users,
      title: "Academic Validation",
      description: "Content is validated by university professors and academic institutions for educational excellence.",
      features: ["University partnerships", "Academic standards", "Research-based", "Curriculum alignment"]
    },
    {
      icon: Star,
      title: "Quality Assurance",
      description: "Multi-layer quality checks ensure content accuracy, relevance, and pedagogical effectiveness.",
      features: ["Content accuracy", "Fact checking", "Regular updates", "Student feedback integration"]
    },
    {
      icon: Globe,
      title: "Global Standards",
      description: "Our content meets international educational standards and best practices from around the world.",
      features: ["International standards", "Best practices", "Global accessibility", "Cultural sensitivity"]
    }
  ];

  const stats = [
    { icon: ShieldCheck, value: "100%", label: "Expert Verified", description: "All courses reviewed by experts" },
    { icon: Star, value: "4.9/5", label: "Quality Rating", description: "Average content quality score" },
    { icon: TrendingUp, value: "98%", label: "Accuracy Rate", description: "Content accuracy verification" }
  ];

  return (
    <section
      id="expert-verified-content"
      className="w-full bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 dark:from-gray-950 dark:via-green-950/20 dark:to-emerald-950/20 py-20 md:py-24 lg:py-32"
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Main Content */}
        <div className="grid grid-cols-1 items-center gap-12 mb-20 lg:grid-cols-2 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex justify-center"
          >
            <div className="relative h-80 w-80">
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 40,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <ShieldCheck className="h-full w-full text-green-200/40 dark:text-green-800/40" />
              </motion.div>
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: -360 }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <ShieldCheck className="h-full w-full scale-75 transform text-emerald-200/40 dark:text-emerald-800/40" />
              </motion.div>
              <ShieldCheck className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-6"
          >
            <Badge className="mb-6 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-4 py-2">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Quality Assurance
            </Badge>

            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl mb-6">
              Expert-Verified{' '}
              <span className="block bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mt-2">
                Content Quality
              </span>
            </h2>

            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              All our content is created and reviewed by subject matter experts to ensure accuracy and quality.
              Learn with confidence from trusted sources backed by industry professionals and academic institutions.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs font-semibold text-green-600 dark:text-green-400">{stat.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{stat.description}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Link to="/marketplace">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Browse Expert Courses
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-2xl"
                onClick={() => {
                  document.getElementById('verification-details')?.scrollIntoView({ behavior: 'smooth' });
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
          id="verification-details"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-12"
        >
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Verification Process
            </Badge>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Multi-Layer Quality Verification
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our rigorous verification process ensures that every piece of content meets the highest standards
              of accuracy, relevance, and educational effectiveness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {verificationFeatures.map((feature, index) => (
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
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
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
            className="text-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl p-8"
          >
            <Heart className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Trust in Quality Education
            </h4>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of learners who trust our expert-verified content to advance their knowledge
              and achieve their educational goals with confidence.
            </p>
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 rounded-2xl">
              <Link to="/marketplace">
                <Zap className="h-5 w-5 mr-2" />
                Start Learning Today
                <Star className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExpertVerifiedContent;