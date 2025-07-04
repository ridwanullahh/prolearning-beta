
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Plus, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import { authService } from '@/lib/auth';
import { db } from '@/lib/github-sdk';
import { toast } from '@/hooks/use-toast';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolvedAt?: string;
}

interface TicketReply {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  createdAt: string;
  isAdminReply: boolean;
}

const TicketSystem = ({ isAdmin = false }: { isAdmin?: boolean }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [showRepliesDialog, setShowRepliesDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general'
  });

  const user = authService.getCurrentUser();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      let ticketsQuery = db.queryBuilder('supportTickets');
      
      if (!isAdmin) {
        ticketsQuery = ticketsQuery.where(item => item.userId === user!.id);
      }
      
      const ticketData = await ticketsQuery
        .orderBy('createdAt', 'desc')
        .exec();
      
      setTickets(ticketData);
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const loadReplies = async (ticketId: string) => {
    try {
      const repliesData = await db.queryBuilder('ticketReplies')
        .where(item => item.ticketId === ticketId)
        .orderBy('createdAt', 'asc')
        .exec();
      setReplies(repliesData);
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  const handleCreateTicket = async () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Subject and message are required',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      await db.insert('supportTickets', {
        userId: user!.id,
        subject: formData.subject,
        message: formData.message,
        priority: formData.priority,
        status: 'open',
        category: formData.category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      toast({
        title: 'Ticket Created',
        description: 'Your support ticket has been created successfully'
      });

      setShowTicketDialog(false);
      setFormData({
        subject: '',
        message: '',
        priority: 'medium',
        category: 'general'
      });
      loadTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to create support ticket',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    try {
      await db.insert('ticketReplies', {
        ticketId: selectedTicket.id,
        userId: user!.id,
        message: replyMessage,
        createdAt: new Date().toISOString(),
        isAdminReply: isAdmin
      });

      // Update ticket status and timestamp
      await db.update('supportTickets', selectedTicket.id, {
        updatedAt: new Date().toISOString(),
        status: isAdmin ? 'awaiting_customer' : 'awaiting_staff'
      });

      setReplyMessage('');
      loadReplies(selectedTicket.id);
      loadTickets();

      toast({
        title: 'Reply Sent',
        description: 'Your reply has been sent successfully'
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive'
      });
    }
  };

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    loadReplies(ticket.id);
    setShowRepliesDialog(true);
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      await db.update('supportTickets', ticketId, {
        status,
        updatedAt: new Date().toISOString(),
        resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined
      });

      loadTickets();
      toast({
        title: 'Status Updated',
        description: `Ticket status updated to ${status}`
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update ticket status',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'text-green-600';
      case 'closed':
        return 'text-red-600';
      case 'open':
        return 'text-blue-600';
      default:
        return 'text-orange-600';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <HelpCircle className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">
            {isAdmin ? 'Support Tickets Management' : 'My Support Tickets'}
          </h2>
        </div>
        
        {!isAdmin && (
          <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                        <SelectItem value="course">Course</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your issue in detail..."
                    rows={6}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowTicketDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTicket} disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Ticket'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>
            {isAdmin ? 'Manage all support tickets' : 'Your support requests and their status'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {isAdmin ? 'No support tickets found' : 'No support tickets yet'}
            </p>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{ticket.subject}</h3>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline">
                        {ticket.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {ticket.message.substring(0, 100)}...
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        {getStatusIcon(ticket.status)}
                        <span className={`ml-1 capitalize ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTicket(ticket)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <>
                        {ticket.status !== 'resolved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateTicketStatus(ticket.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                        )}
                        {ticket.status !== 'closed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateTicketStatus(ticket.id, 'closed')}
                          >
                            Close
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRepliesDialog} onOpenChange={setShowRepliesDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedTicket?.subject}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">Original Message:</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedTicket?.message}
              </p>
            </div>

            {replies.map((reply) => (
              <div
                key={reply.id}
                className={`p-4 rounded-lg ${
                  reply.isAdminReply ? 'bg-blue-50 ml-4' : 'bg-white border mr-4'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    {reply.isAdminReply ? 'Support Team' : 'You'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(reply.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{reply.message}</p>
              </div>
            ))}
          </div>

          {selectedTicket?.status !== 'closed' && selectedTicket?.status !== 'resolved' && (
            <div className="space-y-4 border-t pt-4">
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply..."
                rows={3}
              />
              <div className="flex justify-end">
                <Button onClick={handleSendReply} disabled={!replyMessage.trim()}>
                  Send Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketSystem;
