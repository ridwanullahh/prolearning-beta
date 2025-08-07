import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import SmartHeader from '@/components/layout/SmartHeader';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Mail,
  MessageSquare,
  User,
  Phone,
  MapPin,
  Clock,
  Send,
  Heart,
  Sparkles,
  HelpCircle,
  BookOpen,
  Users
} from 'lucide-react';
import React, { useState } from 'react';

const ContactPage: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help with your account, courses, or technical issues",
      contact: "support@prolearning.com",
      action: "mailto:support@prolearning.com"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our support team",
      contact: "+1 (555) 123-4567",
      action: "tel:+15551234567"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with us in real-time for immediate assistance",
      contact: "Available 24/7",
      action: "#"
    }
  ];

  const faqCategories = [
    {
      icon: BookOpen,
      title: "Course Questions",
      description: "Questions about course content, enrollment, and certificates"
    },
    {
      icon: Users,
      title: "Account Support",
      description: "Help with account settings, billing, and profile management"
    },
    {
      icon: HelpCircle,
      title: "Technical Issues",
      description: "Troubleshooting platform issues and technical problems"
    }
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: 'Message Sent! 🎉',
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-950">
      <SmartHeader />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/20 py-20 md:py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-full bg-blue-500/5 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="container mx-auto px-4 text-center relative z-10"
          >
            <Badge className="mb-6 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-6 py-3 text-lg">
              <Sparkles className="w-5 h-5 mr-2" />
              We're Here to Help
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl mb-6">
              Get in Touch
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mt-4">
                We'd Love to Hear From You
              </span>
            </h1>

            <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              Have a question, feedback, or need support? Our dedicated team is here to help you succeed
              in your learning journey. Reach out to us anytime!
            </p>
          </motion.div>
        </section>

        {/* Contact Methods */}
        <section className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Multiple Ways to Reach Us
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Choose the contact method that works best for you. We're committed to providing
                excellent support across all channels.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <method.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        {method.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {method.description}
                      </p>
                      <a
                        href={method.action}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                      >
                        {method.contact}
                      </a>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & FAQ */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8 }}
              >
                <Card>
                  <CardContent className="p-8">
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Send Us a Message
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Fill out the form below and we'll get back to you as soon as possible.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                          <Input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            className="pl-12 rounded-2xl"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                          <Input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            className="pl-12 rounded-2xl"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="text"
                          name="subject"
                          placeholder="Subject"
                          className="pl-12 rounded-2xl"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                        <Textarea
                          name="message"
                          placeholder="Your Message"
                          className="pl-12 pt-4 rounded-2xl min-h-[120px]"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full group rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* FAQ Categories */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Common Questions
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Before reaching out, check if your question falls into one of these categories.
                  </p>
                </div>

                <div className="space-y-6">
                  {faqCategories.map((category, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-md transition-shadow duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                              <category.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {category.title}
                              </h4>
                              <p className="text-gray-600 dark:text-gray-300">
                                {category.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Response Time */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-6 w-6 text-green-600" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Response Time
                    </h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    We typically respond to all inquiries within 24 hours during business days.
                    For urgent matters, please use our live chat feature.
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto px-4 text-center"
          >
            <Heart className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              We're Here to Support Your Learning Journey
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Your success is our priority. Whether you're a student or instructor,
              we're committed to providing the support you need to thrive.
            </p>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 rounded-2xl">
              <a href="mailto:support@prolearning.com">
                <Mail className="h-5 w-5 mr-2" />
                Email Us Directly
                <ArrowRight className="h-5 w-5 ml-2" />
              </a>
            </Button>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;