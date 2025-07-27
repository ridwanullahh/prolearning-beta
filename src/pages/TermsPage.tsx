import React from 'react';
import { motion } from 'framer-motion';

const TermsPage = () => {
    return (
        <div className="bg-gray-50 dark:bg-gray-950">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">Terms of Service</h1>
                    <div className="prose dark:prose-invert prose-lg max-w-none">
                        <p>Welcome to ProLearning. These terms and conditions outline the rules and regulations for the use of ProLearning's Website, located at prolearning.com.</p>
                        
                        <h2>1. Introduction</h2>
                        <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use ProLearning if you do not agree to take all of the terms and conditions stated on this page.</p>

                        <h2>2. Intellectual Property Rights</h2>
                        <p>Other than the content you own, under these Terms, ProLearning and/or its licensors own all the intellectual property rights and materials contained in this Website.</p>

                        <h2>3. Restrictions</h2>
                        <p>You are specifically restricted from all of the following:</p>
                        <ul>
                            <li>publishing any Website material in any other media;</li>
                            <li>selling, sublicensing and/or otherwise commercializing any Website material;</li>
                            <li>publicly performing and/or showing any Website material;</li>
                            <li>using this Website in any way that is or may be damaging to this Website;</li>
                            <li>using this Website in any way that impacts user access to this Website;</li>
                        </ul>

                        <h2>4. Your Content</h2>
                        <p>In these Website Standard Terms and Conditions, “Your Content” shall mean any audio, video text, images or other material you choose to display on this Website. By displaying Your Content, you grant ProLearning a non-exclusive, worldwide irrevocable, sub licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.</p>

                        <h2>5. No warranties</h2>
                        <p>This Website is provided “as is,” with all faults, and ProLearning express no representations or warranties, of any kind related to this Website or the materials contained on this Website.</p>
                        
                        <h2>6. Limitation of liability</h2>
                        <p>In no event shall ProLearning, nor any of its officers, directors and employees, shall be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract.</p>

                        <h2>7. Governing Law & Jurisdiction</h2>
                        <p>These Terms will be governed by and interpreted in accordance with the laws of the State, and you submit to the non-exclusive jurisdiction of the state and federal courts located in State for the resolution of any disputes.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TermsPage;