import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, ArrowLeft, HelpCircle } from 'lucide-react';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import { toast } from 'sonner';
import SmartHeader from '@/components/layout/SmartHeader';
import Footer from '@/components/layout/Footer';

const SupportTicket = () => {
  const [ticketData, setTicketData] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate('/auth/login');
      return;
    }

    if (!ticketData.subject.trim() || !ticketData.description.trim()) {
      toast.error('Subject and description are required');
      return;
    }

    setSubmitting(true);
    try {
      await db.insert('supportTickets', {
        ...ticketData,
        userId: user.id,
        status: 'open'
      });

      toast.success('Support ticket created successfully! We will get back to you soon.');
      
      // Redirect based on user role
      if (user.role === 'learner') {
        navigate('/dashboard/support');
      } else if (user.role === 'instructor') {
        navigate('/instruct/support');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create support ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <SmartHeader />

      <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Contact Support</h1>
            </div>
            <p className="text-gray-600">
              We're here to help! Submit a support ticket and our team will get back to you.
            </p>
          </div>

          {/* Support Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create Support Ticket</CardTitle>
              <CardDescription>
                Please provide as much detail as possible to help us assist you better.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={ticketData.subject}
                    onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={ticketData.category}
                    onValueChange={(value) => setTicketData({ ...ticketData, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing & Payments</SelectItem>
                      <SelectItem value="course">Course Related</SelectItem>
                      <SelectItem value="account">Account Issues</SelectItem>
                      <SelectItem value="general">General Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={ticketData.priority}
                    onValueChange={(value) => setTicketData({ ...ticketData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={ticketData.description}
                    onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
                    placeholder="Please provide detailed information about your issue..."
                    rows={6}
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Quick Help */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                Before submitting a ticket
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                You might find your answer faster by checking our help center first:
              </p>
              <div className="flex gap-2">
                <Link to="/help">
                  <Button variant="outline" size="sm">
                    Browse Help Articles
                  </Button>
                </Link>
                <Link to="/help">
                  <Button variant="outline" size="sm">
                    Search FAQ
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Login Prompt for Non-Users */}
          {!user && (
            <Card className="mt-8 border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-yellow-800 mb-4">
                    Please log in to submit a support ticket and track your requests.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Link to="/auth/login">
                      <Button>Login</Button>
                    </Link>
                    <Link to="/auth/register">
                      <Button variant="outline">Sign Up</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>

      <Footer />
    </div>
  );
};

export default SupportTicket;