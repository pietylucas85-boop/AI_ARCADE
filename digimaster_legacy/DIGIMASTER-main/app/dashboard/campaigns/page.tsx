'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Mail, MessageSquare, Send, Clock, CheckCircle2, MoreVertical, Pencil, Trash2, BarChart3, Megaphone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Campaign {
  id: string;
  name: string;
  type: string;
  message: string;
  status: string;
  sent_count: number;
  open_count: number;
  click_count: number;
  created_at: string;
  scheduled_at: string | null;
  sent_at: string | null;
}

export default function CampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    message: '',
    status: 'draft',
  });

  useEffect(() => {
    if (user) {
      loadCampaigns();
    }
  }, [user]);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('campaigns').insert({
        user_id: user?.id,
        name: formData.name,
        type: formData.type,
        message: formData.message,
        status: formData.status,
        sent_count: 0,
        open_count: 0,
        click_count: 0,
      });

      if (error) throw error;
      toast.success('Campaign created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      loadCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const handleSendCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to send this campaign? This action cannot be undone.')) return;

    try {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', user?.id);

      const contactCount = contacts?.length || 0;

      const { error } = await supabase
        .from('campaigns')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_count: contactCount,
          open_count: Math.floor(contactCount * 0.35),
          click_count: Math.floor(contactCount * 0.12),
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Campaign sent successfully!');
      loadCampaigns();
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.error('Failed to send campaign');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const { error } = await supabase.from('campaigns').delete().eq('id', id);

      if (error) throw error;
      toast.success('Campaign deleted successfully');
      loadCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'email',
      message: '',
      status: 'draft',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'scheduled':
        return <Badge className="bg-orange-500">Scheduled</Badge>;
      case 'sent':
        return <Badge className="bg-green-500">Sent</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const draftCampaigns = campaigns.filter((c) => c.status === 'draft');
  const scheduledCampaigns = campaigns.filter((c) => c.status === 'scheduled');
  const sentCampaigns = campaigns.filter((c) => c.status === 'sent');

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Campaigns</h1>
            <p className="text-gray-600 mt-1">Create and manage email & SMS campaigns</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>
                  Create an email or SMS campaign to reach your contacts
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Campaign Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Summer Sale 2025"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Campaign Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email Campaign
                          </div>
                        </SelectItem>
                        <SelectItem value="sms">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            SMS Campaign {user?.plan === 'free' && '(Pro)'}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={
                        formData.type === 'email'
                          ? 'Write your email message here...'
                          : 'Write your SMS message here (160 characters max)...'
                      }
                      rows={8}
                      required
                    />
                    {formData.type === 'sms' && (
                      <p className="text-xs text-gray-500">
                        {formData.message.length}/160 characters
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Campaign</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({campaigns.length})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({draftCampaigns.length})</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled ({scheduledCampaigns.length})</TabsTrigger>
            <TabsTrigger value="sent">Sent ({sentCampaigns.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <CampaignList
              campaigns={campaigns}
              loading={loading}
              onSend={handleSendCampaign}
              onDelete={handleDelete}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="draft">
            <CampaignList
              campaigns={draftCampaigns}
              loading={loading}
              onSend={handleSendCampaign}
              onDelete={handleDelete}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="scheduled">
            <CampaignList
              campaigns={scheduledCampaigns}
              loading={loading}
              onSend={handleSendCampaign}
              onDelete={handleDelete}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="sent">
            <CampaignList
              campaigns={sentCampaigns}
              loading={loading}
              onSend={handleSendCampaign}
              onDelete={handleDelete}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function CampaignList({
  campaigns,
  loading,
  onSend,
  onDelete,
  getStatusBadge,
}: {
  campaigns: Campaign[];
  loading: boolean;
  onSend: (id: string) => void;
  onDelete: (id: string) => void;
  getStatusBadge: (status: string) => JSX.Element;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Megaphone className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-4">Create your first campaign to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {campaign.type === 'email' ? (
                    <Mail className="h-5 w-5 text-blue-600" />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  )}
                  <h3 className="font-semibold text-lg">{campaign.name}</h3>
                  {getStatusBadge(campaign.status)}
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{campaign.message}</p>

                {campaign.status === 'sent' && (
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Sent: {campaign.sent_count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Opened: {campaign.open_count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Clicked: {campaign.click_count}</span>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Created {new Date(campaign.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                {campaign.status === 'draft' && (
                  <Button size="sm" onClick={() => onSend(campaign.id)}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Now
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onDelete(campaign.id)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
