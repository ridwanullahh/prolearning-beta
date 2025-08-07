import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  DollarSign,
  Star,
  ArrowRight,
  Sparkles,
  BookOpen,
  TrendingUp
} from 'lucide-react';

const HeroSection = () => {
  const stats = [
    { icon: Users, value: "50K+", label: "Active Students" },
    { icon: DollarSign, value: "$2M+", label: "Instructor Earnings" },
    { icon: Star, value: "4.9/5", label: "Average Rating" },
    { icon: BookOpen, value: "1000+", label: "Courses Created" }
  ];

  return (
    <section className="relative bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 dark:from-gray-950 dark:via-green-950/20 dark:to-emerald-950/20 py-20 md:py-24 lg:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full bg-green-500/5 bg-[radial-gradient(circle_at_50%_50%,rgba(52,211,153,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Badge className="mb-6 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-6 py-3 text-lg">
            <Sparkles className="w-5 h-5 mr-2" />
            Join Our Elite Instructor Network
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl mb-8">
            Share Your Expertise.
            <br />
            <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent mt-4 block">
              Shape the Future of Learning.
            </span>
          </h1>

          <p className="mx-auto max-w-4xl text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-12">
            You are more than an expert; you are a guide. ProLearning invites a select group of passionate educators,
            industry leaders, and seasoned practitioners to partner with us in revolutionizing online education.
          </p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm font-semibold text-green-600 dark:text-green-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-4 text-lg font-semibold shadow-lg shadow-green-600/25">
              <Link to="/auth/register?role=instructor">
                <GraduationCap className="w-5 h-5 mr-2" />
                Apply to Join Our Experts
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="rounded-2xl border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 px-8 py-4 text-lg font-semibold"
              onClick={() => {
                document.getElementById('why-prolearning')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 text-green-600 dark:text-green-400 text-sm font-medium"
          >
            ✨ Selective application process • ✨ Premium instructor support • ✨ Global reach
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;