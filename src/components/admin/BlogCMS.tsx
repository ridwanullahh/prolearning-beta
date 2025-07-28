
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import { Edit, PenTool, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BlogPost {
	id: string;
	title: string;
	content: string;
	authorId: string;
	status: string;
	excerpt?: string;
	featuredImage?: string;
	tags: string;
	slug: string;
	publishedAt?: string;
	createdAt: string;
	updatedAt: string;
	viewCount: number;
	category?: string;
}

const BlogCMS = () => {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		title: '',
		content: '',
		excerpt: '',
		featuredImage: '',
		tags: '',
		category: '',
		status: 'draft',
	});

	const user = authService.getCurrentUser();

	useEffect(() => {
		loadPosts();
	}, []);

	const loadPosts = async () => {
		try {
			const postsData = await db
				.queryBuilder('blogPosts')
				.orderBy('createdAt', 'desc')
				.exec();
			setPosts(postsData);
		} catch (error) {
			console.error('Error loading posts:', error);
			toast.error('Failed to load blog posts');
		} finally {
			setLoading(false);
		}
	};

	const generateSlug = (title: string) => {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9 -]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim();
	};

	const handleSavePost = async () => {
		if (!formData.title.trim() || !formData.content.trim()) {
			toast.error('Title and content are required');
			return;
		}

		try {
			const slug = generateSlug(formData.title);
			const postData = {
				...formData,
				slug,
				authorId: user!.id,
				tags: formData.tags || '[]',
				publishedAt:
					formData.status === 'published' ? new Date().toISOString() : undefined,
			};

			if (isEditing && selectedPost) {
				await db.update('blogPosts', selectedPost.id, {
					...postData,
					updatedAt: new Date().toISOString(),
				});
				toast.success('Post updated successfully');
			} else {
				await db.insert('blogPosts', postData);
				toast.success('Post created successfully');
			}

			setFormData({
				title: '',
				content: '',
				excerpt: '',
				featuredImage: '',
				tags: '',
				category: '',
				status: 'draft',
			});
			setSelectedPost(null);
			setIsEditing(false);
			loadPosts();
		} catch (error) {
			console.error('Error saving post:', error);
			toast.error('Failed to save post');
		}
	};

	const handleEditPost = (post: BlogPost) => {
		setSelectedPost(post);
		setFormData({
			title: post.title,
			content: post.content,
			excerpt: post.excerpt || '',
			featuredImage: post.featuredImage || '',
			tags: post.tags,
			category: post.category || '',
			status: post.status,
		});
		setIsEditing(true);
	};

	const handleDeletePost = async (postId: string) => {
		if (!confirm('Are you sure you want to delete this post?')) return;

		try {
			await db.delete('blogPosts', postId);
			toast.success('Post deleted successfully');
			loadPosts();
		} catch (error) {
			console.error('Error deleting post:', error);
			toast.error('Failed to delete post');
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Blog Management</CardTitle>
				<CardDescription>
					Create and manage your blog posts.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="text-right mb-4">
					<Dialog>
						<DialogTrigger asChild>
							<Button
								onClick={() => {
									setIsEditing(false);
									setSelectedPost(null);
									setFormData({
										title: '',
										content: '',
										excerpt: '',
										featuredImage: '',
										tags: '',
										category: '',
										status: 'draft',
									});
								}}
							>
								<Plus className="h-4 w-4 mr-2" />
								New Post
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>
									{isEditing ? 'Edit Post' : 'Create New Post'}
								</DialogTitle>
								<DialogDescription>
									{isEditing
										? 'Update your blog post'
										: 'Create a new blog post for your platform'}
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="title">Title</Label>
										<Input
											id="title"
											value={formData.title}
											onChange={(e) =>
												setFormData({ ...formData, title: e.target.value })
											}
											placeholder="Enter post title"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="category">Category</Label>
										<Input
											id="category"
											value={formData.category}
											onChange={(e) =>
												setFormData({ ...formData, category: e.target.value })
											}
											placeholder="Enter category"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="excerpt">Excerpt</Label>
									<Textarea
										id="excerpt"
										value={formData.excerpt}
										onChange={(e) =>
											setFormData({ ...formData, excerpt: e.target.value })
										}
										placeholder="Brief description of the post"
										rows={3}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="content">Content</Label>
									<Textarea
										id="content"
										value={formData.content}
										onChange={(e) =>
											setFormData({ ...formData, content: e.target.value })
										}
										placeholder="Write your blog post content here..."
										rows={12}
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="featuredImage">Featured Image URL</Label>
										<Input
											id="featuredImage"
											value={formData.featuredImage}
											onChange={(e) =>
												setFormData({
													...formData,
													featuredImage: e.target.value,
												})
											}
											placeholder="https://example.com/image.jpg"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="tags">Tags (comma-separated)</Label>
										<Input
											id="tags"
											value={formData.tags}
											onChange={(e) =>
												setFormData({ ...formData, tags: e.target.value })
											}
											placeholder="education, learning, online"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="status">Status</Label>
									<Select
										value={formData.status}
										onValueChange={(value) =>
											setFormData({ ...formData, status: value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="draft">Draft</SelectItem>
											<SelectItem value="published">Published</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="flex justify-end gap-2">
									<Button
										variant="outline"
										onClick={() => {
											setFormData({
												title: '',
												content: '',
												excerpt: '',
												featuredImage: '',
												tags: '',
												category: '',
												status: 'draft',
											});
											setSelectedPost(null);
											setIsEditing(false);
										}}
									>
										Cancel
									</Button>
									<Button onClick={handleSavePost}>
										{isEditing ? 'Update Post' : 'Create Post'}
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>
				{posts.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						No blog posts found. Create your first post!
					</div>
				) : (
					<div className="space-y-4">
						{posts.map((post) => (
							<div
								key={post.id}
								className="flex items-center justify-between p-4 border rounded-lg"
							>
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-1">
										<h3 className="font-semibold">{post.title}</h3>
										<Badge
											variant={
												post.status === 'published' ? 'default' : 'secondary'
											}
										>
											{post.status}
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground mb-2 line-clamp-2">
										{post.excerpt || post.content.substring(0, 150) + '...'}
									</p>
									<div className="text-xs text-muted-foreground">
										{post.category && `${post.category} • `}
										Created: {new Date(post.createdAt).toLocaleDateString()} •
										Views: {post.viewCount || 0}
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleEditPost(post)}
									>
										<Edit className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleDeletePost(post.id)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default BlogCMS;
