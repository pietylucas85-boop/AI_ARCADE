'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Globe, Eye, Pencil, Trash2, CheckCircle2, Link as LinkIcon, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import Link from 'next/link';

interface Website {
  id: string;
  name: string;
  template: string;
  custom_domain: string | null;
  published: boolean;
  content: any;
  created_at: string;
}

const templates = [
  { id: 'modern', name: 'Modern Business', image: '🏢', description: 'Clean and professional' },
  { id: 'creative', name: 'Creative Portfolio', image: '🎨', description: 'Bold and artistic' },
  { id: 'minimal', name: 'Minimal Landing', image: '✨', description: 'Simple and elegant' },
  { id: 'restaurant', name: 'Restaurant', image: '🍽️', description: 'Perfect for food business' },
];

export default function WebsitesPage() {
  const { user } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [websiteName, setWebsiteName] = useState('');

  useEffect(() => {
    if (user) {
      loadWebsites();
    }
  }, [user]);

  const loadWebsites = async () => {
    try {
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebsites(data || []);
    } catch (error) {
      console.error('Error loading websites:', error);
      toast.error('Failed to load websites');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user?.plan === 'free' && websites.length >= 1) {
      toast.error('Free plan limited to 1 website. Upgrade to create more!');
      return;
    }

    try {
      const { error } = await supabase.from('websites').insert({
        user_id: user?.id,
        name: websiteName,
        template: selectedTemplate,
        published: false,
        content: {
          title: websiteName,
          tagline: 'Welcome to our website',
          pages: ['Home', 'About', 'Services', 'Contact'],
        },
      });

      if (error) throw error;
      toast.success('Website created successfully!');
      setIsCreateDialogOpen(false);
      setWebsiteName('');
      setSelectedTemplate('modern');
      loadWebsites();
    } catch (error) {
      console.error('Error creating website:', error);
      toast.error('Failed to create website');
    }
  };

  const handlePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('websites')
        .update({ published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Website ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
      loadWebsites();
    } catch (error) {
      console.error('Error updating website:', error);
      toast.error('Failed to update website');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this website?')) return;

    try {
      const { error } = await supabase.from('websites').delete().eq('id', id);

      if (error) throw error;
      toast.success('Website deleted successfully');
      loadWebsites();
    } catch (error) {
      console.error('Error deleting website:', error);
      toast.error('Failed to delete website');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Websites</h1>
            <p className="text-gray-600 mt-1">Build and manage your client websites</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Website
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create New Website</DialogTitle>
                <DialogDescription>
                  Choose a template and name your website
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate}>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Website Name *</Label>
                    <Input
                      id="name"
                      value={websiteName}
                      onChange={(e) => setWebsiteName(e.target.value)}
                      placeholder="My Business Website"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Select Template *</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`p-4 border-2 rounded-lg text-left transition-all hover:border-blue-300 ${
                            selectedTemplate === template.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="text-4xl mb-2">{template.image}</div>
                          <h3 className="font-semibold mb-1">{template.name}</h3>
                          <p className="text-xs text-gray-600">{template.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Website</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-32 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : websites.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Globe className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No websites yet</h3>
                <p className="text-gray-600 mb-4">Create your first website to get started</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Website
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((website) => {
              const template = templates.find((t) => t.id === website.template);
              return (
                <Card key={website.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-6xl">
                      {template?.image || '🌐'}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{website.name}</h3>
                        <p className="text-sm text-gray-600">{template?.name || 'Custom'}</p>
                      </div>
                      {website.published ? (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Live
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </div>
                    {website.custom_domain ? (
                      <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
                        <LinkIcon className="h-4 w-4" />
                        <span>{website.custom_domain}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                        <Crown className="h-4 w-4" />
                        <span>Custom domain available with Pro</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-3">
                      Created {new Date(website.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePublish(website.id, website.published)}
                    >
                      {website.published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(website.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
