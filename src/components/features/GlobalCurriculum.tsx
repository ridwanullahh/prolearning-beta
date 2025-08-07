import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Globe,
  BookOpen,
  Users,
  CheckCircle,
  Star,
  Award,
  Zap,
  TrendingUp,
  Heart,
  Languages,
  MapPin
} from 'lucide-react';
import React from 'react';

const GlobalCurriculum = () => {
  const globalFeatures = [
    {
      icon: Globe,
      title: "International Standards",
      description: "Curriculum aligned with global educational frameworks including IB, Cambridge, and national standards.",
      features: ["IB curriculum", "Cambridge standards", "National frameworks", "Global benchmarks"]
    },
    {
      icon: Languages,
      title: "Multi-Language Support",
      description: "Content available in multiple languages with cultural adaptations for diverse learning contexts.",
      features: ["15+ languages", "Cultural adaptation", "Local examples", "Regional compliance"]
    },
    {
      icon: MapPin,
      title: "Regional Customization",
      description: "Tailored content that respects local educational requirements while maintaining global quality.",
      features: ["Local regulations", "Cultural sensitivity", "Regional examples", "Country-specific content"]
    },
    {
      icon: Award,
      title: "Global Recognition",
      description: "Certificates and credentials recognized by institutions and employers worldwide.",
      features: ["International recognition", "Employer acceptance", "University credits", "Professional certification"]
    }
  ];

  const stats = [
    { icon: Globe, value: "150+", label: "Countries", description: "Students from around the world" },
    { icon: Languages, value: "15+", label: "Languages", description: "Content available in" },
    { icon: Award, value: "95%", label: "Recognition", description: "Global employer acceptance" }
  ];

  return (
    <section
      id="global-curriculum"
      className="w-full bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/20 py-20 md:py-24 lg:py-32"
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Main Content */}
        <div className="grid grid-cols-1 items-center gap-12 mb-20 lg:grid-cols-2 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex justify-center lg:order-2"
          >
            <div className="relative h-80 w-80">
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 70,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <Globe className="h-full w-full text-blue-200/40 dark:text-blue-800/40" />
              </motion.div>
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: -360 }}
                transition={{
                  duration: 50,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <Globe className="h-full w-full scale-75 transform text-indigo-200/40 dark:text-indigo-800/40" />
              </motion.div>
              <Globe className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-6 lg:order-1"
          >
            <Badge className="mb-6 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-4 py-2">
              <Globe className="w-4 h-4 mr-2" />
              Global Education
            </Badge>

            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl mb-6">
              Global{' '}
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
                Curriculum Standards
              </span>
            </h2>

            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              Our curriculum is aligned with international standards, catering to learners from all over the world.
              Access a world-class education from anywhere with content that meets global benchmarks.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">{stat.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{stat.description}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Link to="/marketplace">
                  <BookOpen className="w-5 h-5 mr-2" />
                  See Our Curriculum
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-2xl"
                onClick={() => {
                  document.getElementById('global-details')?.scrollIntoView({ behavior: 'smooth' });
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
          id="global-details"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-12"
        >
          <div className="text-center">
            <Badge className="mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Global Features
            </Badge>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              World-Class Educational Standards
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our global curriculum ensures that learners receive education that meets international standards
              while respecting local contexts and cultural diversity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {globalFeatures.map((feature, index) => (
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
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0">
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
            className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-8"
          >
            <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Join the Global Learning Community
            </h4>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Connect with learners from around the world and access education that meets the highest
              international standards while respecting your local context.
            </p>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 rounded-2xl">
              <Link to="/marketplace">
                <Zap className="h-5 w-5 mr-2" />
                Explore Global Courses
                <Globe className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default GlobalCurriculum;