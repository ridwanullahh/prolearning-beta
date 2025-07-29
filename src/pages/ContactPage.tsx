import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, MessageSquare, User } from 'lucide-react';
import React from 'react';

const ContactPage: React.FC = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: 'Message Sent!',
      description: "We'll get back to you as soon as possible.",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-950">
      <Header />
      <main>
        <section className="bg-green-50/50 py-20 text-center dark:bg-gray-900/50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="container mx-auto px-4"
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              Get in Touch
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Have a question or feedback? We'd love to hear from you.
            </p>
          </motion.div>
        </section>

        <section className="py-20">
          <div className="container mx-auto grid grid-cols-1 gap-12 px-4 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="space-y-6 rounded-2xl bg-gray-50 p-8 dark:bg-gray-900"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Contact Information
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                <a href="mailto:support@prolearning.com" className="flex items-center gap-4 hover:text-green-500">
                  <Mail />
                  support@prolearning.com
                </a>
              </p>
            </motion.div>
            <motion.form
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              onSubmit={handleSubmit}
              className="space-y-6 rounded-2xl bg-gray-50 p-8 dark:bg-gray-900"
            >
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input type="text" placeholder="Your Name" className="pl-12" />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input type="email" placeholder="Your Email" className="pl-12" />
              </div>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <Textarea placeholder="Your Message" className="pl-12 pt-3" />
              </div>
              <Button type="submit" size="lg" className="w-full group rounded-2xl">
                Send Message
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </motion.form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;