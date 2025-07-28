import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const ContactPage = () => {
    return (
        <div className="bg-gray-50 dark:bg-gray-950">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">Get in Touch</h1>
                    <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        We'd love to hear from you. Please fill out the form below or reach out to us using the contact details provided.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay:0.2}}>
                        <form className="space-y-6 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" placeholder="John Doe"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" placeholder="johndoe@example.com"/>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" placeholder="e.g., Course Inquiry"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" placeholder="Your message here..." rows={6}/>
                            </div>
                            <Button type="submit" className="w-full" size="lg">Send Message</Button>
                        </form>
                    </motion.div>
                    <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay:0.4}} className="space-y-6">
                         <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
                            <h3 className="text-2xl font-bold mb-4">Contact Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Mail className="h-6 w-6 text-green-500"/>
                                    <a href="mailto:support@prolearning.com" className="hover:text-green-600">support@prolearning.com</a>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Phone className="h-6 w-6 text-green-500"/>
                                    <span>+1 (555) 123-4567</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <MapPin className="h-6 w-6 text-green-500"/>
                                    <span>123 Learning Lane, Education City, 12345</span>
                                </div>
                            </div>
                        </div>
                         <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
                            <h3 className="text-2xl font-bold mb-4">Frequently Asked Questions</h3>
                             <p className="text-gray-600 dark:text-gray-400">
                                Have a question? Check out our <a href="/help" className="text-green-600 hover:underline">Help Center</a> for answers to common questions.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;