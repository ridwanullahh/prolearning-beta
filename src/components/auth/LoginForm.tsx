
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authService } from '@/lib/auth';
import { Eye, EyeOff, Loader2, Mail, User } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const loginSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const { toast } = useToast();

	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true);
		try {
			const user = await authService.login(data.email, data.password);

			toast({
				title: 'Welcome back!',
				description: `Signed in successfully as ${user.name}`,
			});

			// Redirect to intended page or dashboard
			const from = location.state?.from?.pathname;
			if (from) {
				navigate(from, { replace: true });
			} else {
				const roleRoutes = {
					learner: '/dashboard',
					instructor: '/instruct',
					super_admin: '/super-admin',
				};
				navigate(roleRoutes[user.role], { replace: true });
			}
		} catch (error) {
			toast({
				title: 'Sign in failed',
				description:
					error instanceof Error
						? error.message
						: 'Please check your credentials and try again.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full">
			<div className="text-center">
				<h1 className="text-3xl font-bold">Sign In</h1>
				<p className="text-balance text-muted-foreground">
					Enter your email below to login to your account
				</p>
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<div className="relative">
										<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											{...field}
											type="email"
											placeholder="m@example.com"
											className="pl-10"
											disabled={isLoading}
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center">
									<FormLabel>Password</FormLabel>
									<Link
										to="/auth/forgot-password"
										className="ml-auto inline-block text-sm underline"
									>
										Forgot your password?
									</Link>
								</div>
								<FormControl>
									<div className="relative">
										<User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											{...field}
											type={showPassword ? 'text' : 'password'}
											placeholder="••••••••"
											className="pl-10 pr-10"
											disabled={isLoading}
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
											onClick={() => setShowPassword(!showPassword)}
											disabled={isLoading}
										>
											{showPassword ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</Button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Sign In
					</Button>

					<Button variant="outline" className="w-full" disabled={isLoading}>
						Sign in with Google
					</Button>
				</form>
			</Form>

			<div className="mt-4 text-center text-sm">
				Don't have an account?{' '}
				<Link to="/auth/register" className="underline">
					Sign up
				</Link>
			</div>
		</div>
	);
};

export default LoginForm;
