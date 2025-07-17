
import { Button } from '@/components/ui/button';
import {
	BookOpen,
	Calendar,
	GraduationCap,
	Search,
	Star,
	User,
	Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
	return (
		<div className="flex min-h-screen flex-col">
			<header className="px-4 lg:px-6 h-14 flex items-center bg-background">
				<Link to="/" className="flex items-center justify-center">
					<GraduationCap className="h-6 w-6 text-primary" />
					<span className="sr-only">ProLearning</span>
				</Link>
				<nav className="ml-auto flex gap-4 sm:gap-6">
					<Link
						to="/marketplace"
						className="text-sm font-medium hover:underline underline-offset-4"
					>
						Marketplace
					</Link>
					<Link
						to="#features"
						className="text-sm font-medium hover:underline underline-offset-4"
					>
						Features
					</Link>
					<Link
						to="#pricing"
						className="text-sm font-medium hover:underline underline-offset-4"
					>
						Pricing
					</Link>
					<Link
						to="/auth/login"
						className="text-sm font-medium hover:underline underline-offset-4"
					>
						Sign In
					</Link>
					<Link to="/auth/register">
						<Button>Get Started</Button>
					</Link>
				</nav>
			</header>
			<main className="flex-1">
				<section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
					<div className="container px-4 md:px-6">
						<div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
							<div className="flex flex-col justify-center space-y-4">
								<div className="space-y-2">
									<h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
										Unlock Your Potential with AI-Powered Learning
									</h1>
									<p className="max-w-[600px] text-muted-foreground md:text-xl">
										From early childhood to postgraduate education, ProLearning
										provides personalized AI-generated courses, expert-created
										content, and comprehensive learning tools.
									</p>
								</div>
								<div className="flex flex-col gap-2 min-[400px]:flex-row">
									<Link to="/auth/register">
										<Button size="lg">Start Learning Free</Button>
									</Link>
									<Link to="/marketplace">
										<Button size="lg" variant="outline">
											<Search className="h-4 w-4 mr-2" />
											Explore Courses
										</Button>
									</Link>
								</div>
							</div>
							<img
								src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
								alt="Hero"
								className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
							/>
						</div>
					</div>
				</section>
				{/* Features Section */}
				<section id="features" className="w-full py-12 md:py-24 lg:py-32">
					<div className="container px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="space-y-2">
								<div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
									Key Features
								</div>
								<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
									Everything You Need to Excel
								</h2>
								<p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
									Comprehensive learning tools and AI-powered features
									designed to help you succeed at every level.
								</p>
							</div>
						</div>
						<div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
							<div className="flex flex-col justify-center space-y-4">
								<ul className="grid gap-6">
									<li>
										<div className="grid gap-1">
											<h3 className="text-xl font-bold">
												AI Course Generation
											</h3>
											<p className="text-muted-foreground">
												Generate complete courses with curriculum, lessons,
												quizzes, and more using advanced AI.
											</p>
										</div>
									</li>
									<li>
										<div className="grid gap-1">
											<h3 className="text-xl font-bold">
												Expert Instructors
											</h3>
											<p className="text-muted-foreground">
												Learn from qualified instructors with comprehensive
												course creation tools.
											</p>
										</div>
									</li>
									<li>
										<div className="grid gap-1">
											<h3 className="text-xl font-bold">Global Curriculum</h3>
											<p className="text-muted-foreground">
												Covering all academic levels with Nigerian and
												international equivalence.
											</p>
										</div>
									</li>
								</ul>
							</div>
							<img
								src="https://images.unsplash.com/photo-1588196749333-cf07b8b5a730?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
								alt="Features"
								className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
							/>
						</div>
					</div>
				</section>
				{/* CTA Section */}
				<section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
					<div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
						<div className="space-y-3">
							<h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
								Ready to Transform Your Learning?
							</h2>
							<p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
								Join thousands of learners and educators who are already
								experiencing the future of education.
							</p>
						</div>
						<div className="mx-auto w-full max-w-sm space-y-2">
							<Link to="/auth/register">
								<Button size="lg" className="w-full">
									Start Your Journey Today
								</Button>
							</Link>
						</div>
					</div>
				</section>
			</main>
			<footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
				<p className="text-xs text-muted-foreground">
					&copy; 2024 ProLearning. All rights reserved.
				</p>
				<nav className="sm:ml-auto flex gap-4 sm:gap-6">
					<Link to="#" className="text-xs hover:underline underline-offset-4">
						Terms of Service
					</Link>
					<Link to="#" className="text-xs hover:underline underline-offset-4">
						Privacy
					</Link>
				</nav>
			</footer>
		</div>
	);
};

export default LandingPage;
