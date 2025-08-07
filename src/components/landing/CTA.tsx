import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Users,
  Star,
  BookOpen,
  Award,
  TrendingUp,
  Heart,
  CheckCircle
} from 'lucide-react';

const CTA = () => {
  const benefits = [
    { icon: Zap, text: "Start learning in under 2 minutes" },
    { icon: Star, text: "Join 2M+ successful learners" },
    { icon: Award, text: "Get certified upon completion" },
    { icon: Heart, text: "30-day money-back guarantee" }
  ];

  const stats = [
    { icon: Users, value: "2M+", label: "Active Learners" },
    { icon: BookOpen, value: "10K+", label: "Courses Available" },
    { icon: TrendingUp, value: "95%", label: "Success Rate" },
    { icon: Star, value: "4.9/5", label: "Average Rating" }
  ];

  return (
    <section className="w-full bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 dark:from-gray-950 dark:via-green-950/20 dark:to-emerald-950/20 py-20 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-sm font-semibold text-green-600 dark:text-green-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-2xl shadow-green-600/20">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600" />
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-full bg-white/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
            </div>

            <CardContent className="relative z-10 p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-8"
              >
                <Sparkles className="w-20 h-20 text-green-100 mx-auto" />
              </motion.div>

              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl mb-6">
                Ready to Transform{' '}
                <span className="block text-green-100 mt-2">
                  How You Learn?
                </span>
              </h2>

              <p className="mx-auto max-w-3xl text-xl text-green-100 leading-relaxed mb-10">
                Your personalized educational journey is just one click away. Join ProLearning today
                and unlock a smarter way to achieve your goals with AI-powered learning.
              </p>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-3 text-green-100"
                  >
                    <CheckCircle className="w-5 h-5 text-green-200 flex-shrink-0" />
                    <span className="text-sm font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  asChild
                  size="lg"
                  className="group rounded-2xl bg-white px-8 py-4 text-lg font-bold text-green-600 shadow-xl transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gray-100 hover:shadow-2xl"
                >
                  <Link to="/auth/register">
                    <Zap className="w-5 h-5 mr-2" />
                    Get Started for Free
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-2xl border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm"
                >
                  <Link to="/marketplace">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Browse Courses
                  </Link>
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1 }}
                className="mt-8 text-green-200 text-sm"
              >
                ✨ No credit card required • ✨ Start learning immediately • ✨ Cancel anytime
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;