import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ArrowRight,
  Heart,
  Lock,
  Award,
  Users,
  BookOpen,
  Zap,
  CheckCircle,
  Globe,
  Star,
  TrendingUp
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const Commitment: React.FC = () => {
  const commitments = [
    {
      icon: ShieldCheck,
      title: "Privacy & Security",
      description: "Your data is protected with enterprise-grade security. We never sell your information and maintain strict privacy standards.",
      features: ["End-to-end encryption", "GDPR compliant", "No data selling", "Secure infrastructure"]
    },
    {
      icon: Award,
      title: "Quality Assurance",
      description: "Every course is reviewed by experts and continuously updated to maintain the highest educational standards.",
      features: ["Expert review", "Regular updates", "Quality metrics", "Peer validation"]
    },
    {
      icon: Heart,
      title: "Learner Success",
      description: "We measure our success by yours. Our platform is designed to help you achieve your learning goals effectively.",
      features: ["Success tracking", "Personal support", "Goal achievement", "Progress monitoring"]
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "Education should be available to everyone, everywhere. We're committed to making learning accessible and affordable.",
      features: ["Global access", "Multiple languages", "Affordable pricing", "Inclusive design"]
    }
  ];

  const values = [
    { icon: Star, value: "4.9/5", label: "Trust Rating", description: "From verified learners" },
    { icon: Lock, value: "100%", label: "Data Security", description: "Enterprise-grade protection" },
    { icon: TrendingUp, value: "98%", label: "Uptime", description: "Reliable platform availability" }
  ];

  return (
    <section className="w-full bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 dark:from-gray-950 dark:via-gray-900/50 dark:to-blue-950/20 py-20 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        {/* Main Content */}
        <div className="grid grid-cols-1 items-center gap-12 mb-20 lg:grid-cols-2 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex justify-center"
          >
            <div className="relative flex h-80 w-80 items-center justify-center">
              <motion.div
                className="absolute h-full w-full rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 opacity-30 blur-3xl dark:from-blue-800 dark:to-indigo-700"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute h-3/4 w-3/4 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 opacity-40 blur-2xl dark:from-green-800 dark:to-emerald-700"
                animate={{ scale: [1.1, 1, 1.1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <ShieldCheck className="relative z-10 h-40 w-40 text-blue-600 dark:text-blue-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Badge className="mb-6 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-4 py-2">
              <Heart className="w-4 h-4 mr-2" />
              Our Promise to You
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl mb-6">
              Principled Innovation,{' '}
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
                Proven Pedagogy.
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              We believe the future of education must be built on a foundation of trust and effectiveness.
              Our platform is more than just technology; it's a commitment to making world-class education
              accessible and grounding our AI in learning science that truly works.
            </p>

            {/* Values Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <value.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{value.value}</div>
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">{value.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{value.description}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Link to="/auth/register">
                  <Zap className="w-5 h-5 mr-2" />
                  Join Our Community
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl">
                <Link to="/about">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Our Commitment
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Commitments Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-12"
        >
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Core Commitments
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              These principles guide everything we do, ensuring that your learning experience is safe, effective, and transformative.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {commitments.map((commitment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <commitment.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {commitment.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {commitment.description}
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {commitment.features.map((feature, featureIndex) => (
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
        </motion.div>
      </div>
    </section>
  );
};

export default Commitment;