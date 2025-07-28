import { Button } from '@/components/ui/button';
import { GraduationCap, Search, ChevronRight, Zap, BrainCircuit, ShieldCheck, Globe, Star, Users, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import React from 'react';

const LandingPage: React.FC = () => {
	return (
		<div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
			<Header />
			<main className="flex-1">
				<HeroSection />
                <FeaturesSection />
                <TestimonialsSection />
                <CTASection />
			</main>
			<Footer />
		</div>
	);
};

const Header: React.FC = () => (
    <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 50 }}
        className="px-4 lg:px-6 h-20 flex items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b dark:border-gray-800 sticky top-0 z-50"
    >
        <Link to="/" className="flex items-center justify-center gap-2">
            <GraduationCap className="h-8 w-8 text-green-500" />
            <span className="text-2xl font-bold">ProLearning</span>
        </Link>
        <nav className="ml-auto hidden lg:flex gap-6 items-center">
            <NavLink href="/marketplace">Marketplace</NavLink>
            <NavLink href="#features">Features</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/contact">Contact</NavLink>
        </nav>
        <div className="ml-auto lg:ml-6 flex items-center gap-2">
            <Button variant="ghost" asChild><Link to="/auth/login">Sign In</Link></Button>
            <Button asChild className="rounded-full bg-green-500 hover:bg-green-600 text-white">
                <Link to="/auth/register">Get Started Free</Link>
            </Button>
        </div>
    </motion.header>
);

const NavLink: React.FC<{ href: string, children: React.ReactNode }> = ({ href, children }) => (
    <Link to={href} className="text-sm font-medium hover:text-green-500 transition-colors">{children}</Link>
);

const HeroSection = () => (
    <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/50 dark:via-emerald-950/50 dark:to-teal-950/50">
        <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
                <div className="flex flex-col justify-center space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter">
                            The Future of Learning is Here.
                        </h1>
                        <p className="max-w-[600px] text-muted-foreground md:text-xl mt-4">
                            ProLearning combines cutting-edge AI with expert-crafted content to deliver a learning experience that's personalized, engaging, and effective.
                        </p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex flex-col gap-4 min-[400px]:flex-row">
                        <Button size="lg" asChild className="rounded-full">
                            <Link to="/auth/register">Start Learning For Free <ChevronRight className="h-4 w-4 ml-2"/></Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="rounded-full">
                            <Link to="/marketplace"><Search className="h-4 w-4 mr-2"/>Explore Courses</Link>
                        </Button>
                    </motion.div>
                </div>
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="relative">
                    <div className="relative w-full h-80 lg:h-96 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_rgba(255,255,255,0)_70%)]"/>
                        <Zap className="absolute top-8 left-8 h-16 w-16 text-white/50 transform -rotate-12"/>
                        <BrainCircuit className="absolute bottom-8 right-8 h-20 w-20 text-white/50 transform rotate-12"/>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white">
                            <h3 className="text-3xl font-bold">AI-Powered</h3>
                            <p>Personalized Learning Paths</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    </section>
);

const FeaturesSection = () => (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Choose ProLearning?</h2>
                <p className="max-w-[900px] mx-auto text-muted-foreground md:text-xl">
                    We provide tools and content for every step of the educational journey.
                </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <FeatureCard icon={Zap} title="AI Course Generation" description="Instantly create comprehensive courses on any subject, complete with lessons, quizzes, and practical exercises."/>
                <FeatureCard icon={BrainCircuit} title="Smart Learning Tools" description="From interactive flashcards to AI-driven study planners, we make learning more efficient and engaging."/>
                <FeatureCard icon={ShieldCheck} title="Expert-Verified Content" description="All our content is created and reviewed by subject matter experts to ensure accuracy and quality."/>
                <FeatureCard icon={Globe} title="Global Curriculum" description="Our curriculum is aligned with international standards, catering to learners from all over the world."/>
                <FeatureCard icon={Users} title="Collaborative Learning" description="Join study groups, participate in forums, and learn together with a global community of learners."/>
                <FeatureCard icon={BarChart3} title="Track Your Progress" description="Detailed analytics and progress tracking to help you stay motivated and achieve your learning goals."/>
            </div>
        </div>
    </section>
);

const FeatureCard: React.FC<{ icon: React.ElementType, title: string, description: string }> = ({ icon: Icon, title, description }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} className="p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-lg border border-transparent hover:border-green-500 transition-all">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
            <Icon className="h-6 w-6 text-green-600 dark:text-green-400"/>
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </motion.div>
)

const TestimonialsSection = () => (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
             <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Loved by Learners & Educators</h2>
                <p className="max-w-[900px] mx-auto text-muted-foreground md:text-xl">
                    Don't just take our word for it. Here's what people are saying.
                </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <TestimonialCard name="Sarah J." role="Student" text="ProLearning has completely changed how I study. The AI-generated courses are tailored perfectly to my needs."/>
                <TestimonialCard name="Dr. Michael P." role="University Professor" text="As an educator, the tools to create and manage courses are second to none. My students' engagement has skyrocketed."/>
                <TestimonialCard name="David L." role="Lifelong Learner" text="I can finally learn about anything I'm curious about, instantly. It's like having a personal tutor for every subject."/>
            </div>
        </div>
    </section>
);

const TestimonialCard: React.FC<{ name: string, role: string, text: string }> = ({ name, role, text }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-lg text-gray-600 dark:text-gray-300">
                {name.charAt(0)}
            </div>
            <div className="ml-4">
                <h4 className="font-bold">{name}</h4>
                <p className="text-sm text-muted-foreground">{role}</p>
            </div>
        </div>
        <p className="text-muted-foreground">"{text}"</p>
        <div className="flex mt-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-current"/>)}
        </div>
    </motion.div>
)

const CTASection = () => (
    <section className="w-full py-20 md:py-32">
        <div className="container text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tighter">
                Ready to Start Your Learning Adventure?
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground md:text-xl mt-4">
                Join ProLearning today and get instant access to a world of knowledge.
            </p>
            <div className="mt-8">
                <Button size="lg" asChild className="rounded-full">
                    <Link to="/auth/register">Sign Up For Free</Link>
                </Button>
            </div>
        </div>
    </section>
);

const Footer = () => (
    <footer className="border-t dark:border-gray-800">
        <div className="container py-12 px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-4">
                <div className="space-y-4">
                    <Link to="/" className="flex items-center gap-2">
                        <GraduationCap className="h-8 w-8 text-green-500"/>
                        <span className="text-2xl font-bold">ProLearning</span>
                    </Link>
                    <p className="text-sm text-muted-foreground">The future of personalized education.</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-4">Platform</h4>
                    <ul className="space-y-2">
                        <li><NavLink href="/marketplace">Marketplace</NavLink></li>
                        <li><NavLink href="#features">Features</NavLink></li>
                        <li><NavLink href="/auth/register">Sign Up</NavLink></li>
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold mb-4">Company</h4>
                    <ul className="space-y-2">
                        <li><NavLink href="/about">About Us</NavLink></li>
                        <li><NavLink href="/blog">Blog</NavLink></li>
                        <li><NavLink href="/contact">Contact</NavLink></li>
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold mb-4">Legal</h4>
                    <ul className="space-y-2">
                        <li><NavLink href="/terms">Terms of Service</NavLink></li>
                        <li><NavLink href="/privacy">Privacy Policy</NavLink></li>
                    </ul>
                </div>
            </div>
            <div className="mt-8 border-t dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-xs text-muted-foreground">&copy; 2024 ProLearning. All rights reserved.</p>
                {/* Social media links can go here */}
            </div>
        </div>
    </footer>
);


export default LandingPage;
