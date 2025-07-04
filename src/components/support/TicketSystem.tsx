
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HelpCircle, Plus, MessageSquare, Clock, CheckCircle } from 'lucide-react';
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

const TicketSystem = ({ isAdmin = false }: { isAdmin?: boolean }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTicketData, setNewTicketData] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium'
  });
  const [replyMessage, setReplyMessage] = useState('');

  const user = authService.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user, isAdmin]);

  const loadTickets = async () => {
    try {
      let ticketsData;
      if (isAdmin) {
        // Admin sees all tickets
        ticketsData = await db.queryBuilder('supportTickets')
          .orderBy('createdAt', 'desc')
          .exec();
      } else {
        // Users see only their tickets
        ticketsData = await db.queryBuilder('supportTickets')
          .where(item => item.userId === user!.id)
          .orderBy('createdAt', 'desc')
          .exec();
      }
      setTickets(ticketsData);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadTicketReplies = async (ticketId: string) => {
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
    if (!newTicketData.subject.trim() || !newTicketData.description.trim()) {
      toast.error('Subject and description are required');
      return;
    }

    try {
      await db.insert('supportTickets', {
        ...newTicketData,
        userId: user!.id
      });

      toast.success('Support ticket created successfully');
      setNewTicketData({
        subject: '',
        description: '',
        category: '',
        priority: 'medium'
      });
      loadTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
    }
  };

  const handleReplyToTicket = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    try {
      await db.insert('ticketReplies', {
        ticketId: selectedTicket.id,
        userId: user!.id,
        message: replyMessage,
        isStaff: isAdmin
      });

      // Update ticket status
      await db.update('supportTickets', selectedTicket.id, {
        updatedAt: new Date().toISOString(),
        status: isAdmin ? 'awaiting_customer' : 'awaiting_staff'
      });

      toast.success('Reply sent successfully');
      setReplyMessage('');
      loadTicketReplies(selectedTicket.id);
      loadTickets();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString()
      };

      if (status === 'resolved') {
        updateData.resolvedAt = new Date().toISOString();
      }

      if (isAdmin && status !== 'open') {
        updateData.assignedTo = user!.id;
      }

      await db.update('supportTickets', ticketId, updateData);
      toast.success('Ticket status updated');
      loadTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
    }
  };

  const getStatusBadgeColor = (status: string) => {
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

  const getPriorityBadgeColor = (priority: string) => {
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">
            {isAdmin ? 'Support Management' : 'Support Tickets'}
          </h1>
        </div>
        {!isAdmin && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
                <DialogDescription>
                  Describe your issue and we'll help you resolve it
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newTicketData.subject}
                    onChange={(e) => setNewTicketData({ ...newTicketData, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newTicketData.category}
                    onValueChange={(value) => setNewTicketData({ ...newTicketData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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
                    value={newTicketData.priority}
                    onValueChange={(value) => setNewTicketData({ ...newTicketData, priority: value })}
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTicketData.description}
                    onChange={(e) => setNewTicketData({ ...newTicketData, description: e.target.value })}
                    placeholder="Provide detailed information about your issue..."
                    rows={6}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNewTicketData({
                    subject: '',
                    description: '',
                    category: '',
                    priority: 'medium'
                  })}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTicket}>
                    Create Ticket
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length > 0 && (
                  <Badge className="mr-2">
                    {tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length} Active
                  </Badge>
                )}
                All Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {tickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No tickets found
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTicket?.id === ticket.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        loadTicketReplies(ticket.id);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm line-clamp-1">{ticket.subject}</h4>
                        <div className="flex gap-1">
                          <Badge className={getStatusBadgeColor(ticket.status)} variant="secondary">
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">{ticket.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{ticket.category}</span>
                        <Badge className={getPriorityBadgeColor(ticket.priority)} variant="secondary">
                          {ticket.priority}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                    <CardDescription className="mt-1">
                      Created {new Date(selectedTicket.createdAt).toLocaleDateString()} • 
                      Category: {selectedTicket.category}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityBadgeColor(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </Badge>
                    <Badge className={getStatusBadgeColor(selectedTicket.status)}>
                      {selectedTicket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'in_progress')}
                      disabled={selectedTicket.status === 'in_progress'}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      In Progress
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'resolved')}
                      disabled={selectedTicket.status === 'resolved'}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolve
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Original Ticket */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium mb-2">Original Issue:</div>
                    <p className="text-sm">{selectedTicket.description}</p>
                  </div>

                  {/* Replies */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`p-3 rounded-lg ${
                          reply.isStaff ? 'bg-blue-50 ml-8' : 'bg-white border mr-8'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {reply.isStaff ? 'Support Staff' : 'You'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(reply.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{reply.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply Form */}
                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                    <div className="space-y-3 border-t pt-4">
                      <Textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply..."
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleReplyToTicket}
                          disabled={!replyMessage.trim()}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[400px]">
                <div className="text-center text-gray-500">
                  <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a Ticket</h3>
                  <p>Choose a ticket from the list to view details and replies</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketSystem;
