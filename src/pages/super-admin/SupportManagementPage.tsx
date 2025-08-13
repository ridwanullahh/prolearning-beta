import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  MessageSquare, 
  Clock, 
  User, 
  Search,
  Filter,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Tag,
  Archive,
  Send,
  Paperclip,
  Star,
  TrendingUp,
  Users,
  Timer,
  Target
} from 'lucide-react';
import { db } from '@/lib/github-sdk';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  messages: SupportMessage[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  satisfaction?: number;
}

interface SupportMessage {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    type: 'user' | 'agent';
  };
  attachments?: string[];
  createdAt: string;
}

interface SupportAgent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  activeTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  satisfaction: number;
}

const SupportManagementPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();
  const currentUser = authService.getCurrentUser();

  const categories = [
    'Technical Issue',
    'Account Problem',
    'Billing Question',
    'Feature Request',
    'Course Content',
    'General Inquiry'
  ];

  useEffect(() => {
    loadTickets();
    loadAgents();
  }, []);

  const loadTickets = async () => {
    try {
      const ticketsData = await db.get('supportTickets') || [];
      setTickets(ticketsData);
    } catch (error) {
      console.error('Error loading support tickets:', error);
    }
  };

  const loadAgents = async () => {
    try {
      const usersData = await db.get('users') || [];
      const supportAgents = usersData
        .filter((user: any) => user.role === 'admin' || user.role === 'support')
        .map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isOnline: Math.random() > 0.3, // Mock online status
          activeTickets: Math.floor(Math.random() * 10),
          resolvedTickets: Math.floor(Math.random() * 100),
          avgResponseTime: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
          satisfaction: 4 + Math.random() // 4-5 rating
        }));
      setAgents(supportAgents);
    } catch (error) {
      console.error('Error loading support agents:', error);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: SupportTicket['status']) => {
    try {
      const updatedTicket = {
        status,
        updatedAt: new Date().toISOString(),
        resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined
      };

      await db.update('supportTickets', ticketId, updatedTicket);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...updatedTicket } : t));
      
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, ...updatedTicket } : null);
      }

      toast({
        title: "Ticket Updated",
        description: `Ticket status changed to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status.",
        variant: "destructive"
      });
    }
  };

  const assignTicket = async (ticketId: string, agentId: string) => {
    try {
      const agent = agents.find(a => a.id === agentId);
      if (!agent) return;

      const updatedTicket = {
        assignedTo: {
          id: agent.id,
          name: agent.name,
          avatar: agent.avatar
        },
        status: 'in-progress' as const,
        updatedAt: new Date().toISOString()
      };

      await db.update('supportTickets', ticketId, updatedTicket);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...updatedTicket } : t));
      
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, ...updatedTicket } : null);
      }

      toast({
        title: "Ticket Assigned",
        description: `Ticket assigned to ${agent.name}.`,
      });
    } catch (error) {
      console.error('Error assigning ticket:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    setIsLoading(true);
    try {
      const message: SupportMessage = {
        id: `msg_${Date.now()}`,
        content: newMessage,
        author: {
          id: currentUser?.id || '',
          name: currentUser?.name || 'Support Agent',
          type: 'agent'
        },
        createdAt: new Date().toISOString()
      };

      const updatedTicket = {
        ...selectedTicket,
        messages: [...selectedTicket.messages, message],
        updatedAt: new Date().toISOString()
      };

      await db.update('supportTickets', selectedTicket.id, updatedTicket);
      setSelectedTicket(updatedTicket);
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      setNewMessage('');

      toast({
        title: "Message Sent",
        description: "Your response has been sent to the user.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-600';
      case 'in-progress': return 'bg-yellow-600';
      case 'resolved': return 'bg-green-600';
      case 'closed': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    avgResponseTime: 45, // Mock data
    satisfaction: 4.2 // Mock data
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-2xl">
            <MessageSquare className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Support Management</h1>
            <p className="text-green-100">Manage customer support tickets and help desk operations</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Timer className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Star className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">{stats.satisfaction}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tickets List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tickets */}
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <Card 
                key={ticket.id} 
                className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  selectedTicket?.id === ticket.id ? 'ring-2 ring-green-500' : ''
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">{ticket.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{ticket.user.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      {ticket.assignedTo && (
                        <div className="flex items-center gap-1">
                          <span>Assigned to {ticket.assignedTo.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{ticket.messages.length} messages</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredTickets.length === 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tickets Found</h3>
                  <p className="text-gray-600">No support tickets match your current filters.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="space-y-6">
          {selectedTicket ? (
            <>
              {/* Ticket Info */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Ticket Details</span>
                    <div className="flex gap-2">
                      <Select
                        value={selectedTicket.status}
                        onValueChange={(value: any) => updateTicketStatus(selectedTicket.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{selectedTicket.subject}</h4>
                    <p className="text-gray-600 text-sm">{selectedTicket.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">User:</span>
                      <p className="font-medium">{selectedTicket.user.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Priority:</span>
                      <Badge className={getPriorityColor(selectedTicket.priority)} size="sm">
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <p className="font-medium">{selectedTicket.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <p className="font-medium">{new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {!selectedTicket.assignedTo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Agent</label>
                      <Select onValueChange={(value) => assignTicket(selectedTicket.id, value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select agent" />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map(agent => (
                            <SelectItem key={agent.id} value={agent.id}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${agent.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                                {agent.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Messages */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Conversation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                    {selectedTicket.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.author.type === 'agent' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.author.type === 'agent'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.author.type === 'agent' ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {message.author.name} • {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your response..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={3}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || !newMessage.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Ticket</h3>
                <p className="text-gray-600">Choose a ticket from the list to view details and respond.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportManagementPage;
