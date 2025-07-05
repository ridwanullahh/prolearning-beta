
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Send,
  FileText
} from 'lucide-react';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import { toast } from 'sonner';

interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface TicketReply {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isStaff: boolean;
  attachments?: string;
  createdAt: string;
}

const SupportTicket = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const user = authService.getCurrentUser();

  useEffect(() => {
    if (id && user) {
      loadTicketData();
    }
  }, [id, user]);

  const loadTicketData = async () => {
    if (!id || !user) return;

    try {
      // Load ticket
      const ticketData = await db.getItem('supportTickets', id);
      if (!ticketData) {
        toast.error('Ticket not found');
        navigate('/support');
        return;
      }

      // Check if user owns this ticket or is admin
      if (ticketData.userId !== user.id && user.role !== 'super_admin') {
        toast.error('Access denied');
        navigate('/support');
        return;
      }

      setTicket(ticketData);

      // Load replies
      const repliesData = await db.queryBuilder('ticketReplies')
        .where(item => item.ticketId === id)
        .orderBy('createdAt', 'asc')
        .exec();
      
      setReplies(repliesData);
    } catch (error) {
      console.error('Error loading ticket:', error);
      toast.error('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !ticket || !user) return;

    setSubmitting(true);
    try {
      await db.insert('ticketReplies', {
        ticketId: ticket.id,
        userId: user.id,
        message: newReply,
        isStaff: user.role === 'super_admin'
      });

      // Update ticket status
      const newStatus = user.role === 'super_admin' ? 'awaiting_customer' : 'awaiting_staff';
      await db.update('supportTickets', ticket.id, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      toast.success('Reply sent successfully');
      setNewReply('');
      loadTicketData();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'awaiting_staff':
        return 'bg-orange-100 text-orange-800';
      case 'awaiting_customer':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ticket Not Found</h2>
          <p className="text-gray-600 mb-4">The support ticket you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/support')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Support
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/support')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Support
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {ticket.subject}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {user?.name}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(ticket.priority)}>
                {ticket.priority}
              </Badge>
              <Badge className={getStatusColor(ticket.status)}>
                {ticket.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Details & Conversation */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 pr-4">
                  {/* Original Message */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{user?.name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{ticket.description}</p>
                  </div>

                  {/* Replies */}
                  {replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`mb-4 p-4 rounded-lg ${
                        reply.isStaff ? 'bg-blue-50 ml-4' : 'bg-white border mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {reply.isStaff ? 'Support Staff' : user?.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(reply.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{reply.message}</p>
                    </div>
                  ))}
                </ScrollArea>

                {/* Reply Form */}
                {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                  <>
                    <Separator className="my-6" />
                    <form onSubmit={handleReplySubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="reply">Add Reply</Label>
                        <Textarea
                          id="reply"
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                          placeholder="Type your message..."
                          rows={4}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={submitting || !newReply.trim()}>
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Reply
                          </>
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Info */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Category</Label>
                  <p className="text-sm text-gray-900 capitalize">{ticket.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Priority</Label>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created</Label>
                  <p className="text-sm text-gray-900">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                  <p className="text-sm text-gray-900">
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </p>
                </div>
                {ticket.resolvedAt && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Resolved</Label>
                    <p className="text-sm text-gray-900">
                      {new Date(ticket.resolvedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Actions (for admins) */}
            {user?.role === 'super_admin' && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      db.update('supportTickets', ticket.id, {
                        status: 'in_progress',
                        updatedAt: new Date().toISOString()
                      });
                      loadTicketData();
                    }}
                    disabled={ticket.status === 'in_progress'}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Mark In Progress
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      db.update('supportTickets', ticket.id, {
                        status: 'resolved',
                        resolvedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      });
                      loadTicketData();
                    }}
                    disabled={ticket.status === 'resolved'}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Resolved
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTicket;
