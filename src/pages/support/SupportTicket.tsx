
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Plus, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const SupportTicket = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tickets');
  const { toast } = useToast();
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadTickets();
  }, [user, navigate]);

  const loadTickets = async () => {
    if (!user) return;
    
    try {
      const userTickets = await db.queryBuilder('supportTickets')
        .where((ticket: any) => ticket.userId === user.id)
        .orderBy('createdAt', 'desc')
        .exec();
      setTickets(userTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const createTicket = async () => {
    if (!user) return;
    
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const ticket = await db.insert('supportTickets', {
        userId: user.id,
        userEmail: user.email,
        userName: user.displayName || user.email,
        subject: newTicket.subject,
        category: newTicket.category,
        priority: newTicket.priority,
        description: newTicket.description,
        status: 'open'
      });

      setTickets(prev => [ticket, ...prev]);
      setNewTicket({
        subject: '',
        category: 'general',
        priority: 'medium',
        description: ''
      });
      setActiveTab('tickets');
      
      toast({
        title: 'Success',
        description: 'Support ticket created successfully',
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to create support ticket',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'in_progress':
        return <Eye className="h-4 w-4 text-yellow-600" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      open: 'default',
      in_progress: 'secondary',
      resolved: 'default',
      closed: 'outline'
    };
    return variants[status] || 'outline';
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      low: 'outline',
      medium: 'secondary',
      high: 'destructive',
      urgent: 'destructive'
    };
    return variants[priority] || 'outline';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access support tickets</p>
          <Button onClick={() => navigate('/login')}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/help')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Help Center
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
                  <p className="text-gray-600">Manage your support requests</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Tickets */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tickets" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                My Tickets ({tickets.length})
              </TabsTrigger>
              <TabsTrigger value="new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Ticket
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tickets" className="mt-6">
              {tickets.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No support tickets</h3>
                    <p className="text-gray-600 mb-4">You haven't created any support tickets yet.</p>
                    <Button onClick={() => setActiveTab('new')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Ticket
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <Card key={ticket.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(ticket.status)}
                              <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                            </div>
                            <p className="text-gray-600 mb-3">{ticket.description}</p>
                            <div className="flex gap-2 text-sm text-gray-500">
                              <span>#{ticket.id.slice(0, 8)}</span>
                              <span>•</span>
                              <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{ticket.category}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <Badge variant={getStatusBadge(ticket.status)}>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant={getPriorityBadge(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        {ticket.adminResponse && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Admin Response:</h4>
                            <p className="text-blue-800">{ticket.adminResponse}</p>
                            {ticket.respondedAt && (
                              <p className="text-xs text-blue-600 mt-2">
                                Responded on {new Date(ticket.respondedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="new" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Support Ticket</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={newTicket.category}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="general">General</option>
                        <option value="technical">Technical</option>
                        <option value="billing">Billing</option>
                        <option value="course">Course</option>
                        <option value="account">Account</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <select
                        id="priority"
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTicket.description}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Please provide detailed information about your issue..."
                      rows={6}
                    />
                  </div>

                  <Button 
                    onClick={createTicket} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Creating...' : 'Create Support Ticket'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SupportTicket;
