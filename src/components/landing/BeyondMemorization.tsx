import { motion } from 'framer-motion';
import {
  BrainCircuit,
  ArrowRight,
  Lightbulb,
  Target,
  Zap,
  CheckCircle,
  TrendingUp,
  Award,
  Users,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const BeyondMemorization = () => {
  const principles = [
    {
      icon: Lightbulb,
      title: "Critical Thinking",
      description: "Develop analytical skills that help you question, evaluate, and synthesize information effectively.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Target,
      title: "Practical Application",
      description: "Learn through real-world scenarios and projects that mirror actual professional challenges.",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: TrendingUp,
      title: "Continuous Growth",
      description: "Build a foundation for lifelong learning with skills that adapt to changing industries.",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const outcomes = [
    { icon: Award, value: "92%", label: "Skill Application", description: "Students apply skills in real projects" },
    { icon: Users, value: "87%", label: "Career Advancement", description: "Learners advance in their careers" },
    { icon: TrendingUp, value: "4.2x", label: "Problem Solving", description: "Improvement in critical thinking" }
  ];

  return (
    <section className="w-full bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/20 py-20 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        {/* Main Content */}
        <div className="grid grid-cols-1 items-center gap-12 mb-20 lg:grid-cols-2 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Badge className="mb-6 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-4 py-2">
              <BrainCircuit className="w-4 h-4 mr-2" />
              Deep Learning Philosophy
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl mb-6">
              From Information to{' '}
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
                Application.
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              True learning isn't about memorizing facts; it's about building applicable skills.
              ProLearning is designed to take you beyond the surface level, fostering critical
              thinking and genuine comprehension that you can carry into the real world.
            </p>

            {/* Outcomes Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {outcomes.map((outcome, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <outcome.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{outcome.value}</div>
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">{outcome.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{outcome.description}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Link to="/auth/register">
                  <Zap className="w-5 h-5 mr-2" />
                  Start Deep Learning
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl">
                <Link to="/about">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Our Philosophy
                </Link>
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
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
                <BrainCircuit className="h-full w-full text-blue-200/60 dark:text-blue-800/40" />
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
                <BrainCircuit className="h-full w-full scale-75 transform text-indigo-200/60 dark:text-indigo-800/40" />
              </motion.div>
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 180 }}
                transition={{
                  duration: 50,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <BrainCircuit className="h-full w-full scale-50 transform text-purple-200/60 dark:text-purple-800/40" />
              </motion.div>
              <BrainCircuit className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 text-blue-600" />
            </div>
          </motion.div>
        </div>

        {/* Principles Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-12"
        >
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Learning Principles
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We believe in education that transforms not just what you know, but how you think and solve problems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {principles.map((principle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${principle.color} rounded-3xl flex items-center justify-center mx-auto mb-6`}>
                      <principle.icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      {principle.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {principle.description}
                    </p>
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

export default BeyondMemorization;