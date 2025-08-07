import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Users,
  MessageSquare,
  Share2,
  UserPlus,
  Trophy,
  CheckCircle,
  Lightbulb,
  Heart,
  Globe,
  BookOpen,
  Target
} from 'lucide-react';
import React from 'react';

const CollaborativeLearning = () => {
  const collaborativeFeatures = [
    {
      icon: MessageSquare,
      title: "Study Groups & Forums",
      description: "Connect with fellow learners through organized study groups and topic-specific discussion forums.",
      features: ["Real-time chat", "Voice discussions", "File sharing", "Group scheduling"]
    },
    {
      icon: Share2,
      title: "Knowledge Sharing",
      description: "Share notes, insights, and resources with your learning community to enhance everyone's experience.",
      features: ["Note sharing", "Resource libraries", "Peer reviews", "Collaborative documents"]
    },
    {
      icon: UserPlus,
      title: "Peer Mentoring",
      description: "Learn from experienced peers and mentor newcomers in a supportive learning environment.",
      features: ["Mentor matching", "Progress tracking", "Achievement sharing", "Skill exchanges"]
    },
    {
      icon: Trophy,
      title: "Team Challenges",
      description: "Participate in collaborative challenges and competitions to make learning fun and engaging.",
      features: ["Group competitions", "Team projects", "Leaderboards", "Achievement badges"]
    }
  ];

  return (
    <section
      id="collaborative-learning"
      className="w-full bg-white py-20 dark:bg-gray-950 md:py-24 lg:py-32"
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Main Feature Section */}
        <div className="grid grid-cols-1 items-center gap-12 mb-20 md:grid-cols-2 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex justify-center"
          >
            <div className="relative h-64 w-64">
              <motion.div
                className="absolute inset-0"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
              >
                <Users className="h-full w-full text-green-200/50 dark:text-green-800/50" />
              </motion.div>
              <Users className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 text-green-500" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-gray-800 dark:text-green-400">
                <Users className="h-8 w-8" />
              </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Collaborative Learning
            </h2>
          </div>
          <p className="max-w-xl text-lg text-gray-600 dark:text-gray-300">
            Join study groups, participate in forums, and learn together with a
            global community of learners. Share knowledge and grow together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="group rounded-2xl">
              <Link to="/dashboard">
                Join the Community
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-2xl"
              onClick={() => {
                document.getElementById('collaborative-details')?.scrollIntoView({ behavior: 'smooth' });
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
        id="collaborative-details"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="space-y-12"
      >
        <div className="text-center">
          <Badge className="mb-4 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            Community Features
          </Badge>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Learn Better Together
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Research shows that collaborative learning improves retention, engagement, and understanding.
            Our platform makes it easy to connect, share, and grow with fellow learners worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collaborativeFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                      <feature.icon className="h-6 w-6" />
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
          className="text-center bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-3xl p-8"
        >
          <Heart className="h-12 w-12 text-orange-600 mx-auto mb-4" />
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Join Our Learning Community
          </h4>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Connect with thousands of passionate learners from around the world.
            Share knowledge, get support, and achieve your goals together.
          </p>
          <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700 rounded-2xl">
            <Link to="/dashboard">
              <Globe className="h-5 w-5 mr-2" />
              Start Collaborating
              <Users className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
      </div>
    </section>
  );
};

export default CollaborativeLearning;