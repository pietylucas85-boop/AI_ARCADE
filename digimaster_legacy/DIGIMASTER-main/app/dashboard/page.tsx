'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Megaphone, Globe, Sparkles, Plus, TrendingUp, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    contacts: 0,
    campaigns: 0,
    websites: 0,
    chatMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const [contacts, campaigns, websites, chatMessages] = await Promise.all([
        supabase.from('contacts').select('id', { count: 'exact' }).eq('user_id', user?.id),
        supabase.from('campaigns').select('id', { count: 'exact' }).eq('user_id', user?.id),
        supabase.from('websites').select('id', { count: 'exact' }).eq('user_id', user?.id),
        supabase.from('chat_messages').select('id', { count: 'exact' }).eq('user_id', user?.id).eq('role', 'user'),
      ]);

      setStats({
        contacts: contacts.count || 0,
        campaigns: campaigns.count || 0,
        websites: websites.count || 0,
        chatMessages: chatMessages.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'User'}!</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your business today.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Contacts</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.contacts}</div>
              <p className="text-xs text-gray-500 mt-2">
                {user?.plan === 'free' ? `${100 - stats.contacts} remaining` : 'Unlimited'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Campaigns</CardTitle>
              <Megaphone className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.campaigns}</div>
              <p className="text-xs text-gray-500 mt-2">Total campaigns created</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Websites</CardTitle>
              <Globe className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.websites}</div>
              <p className="text-xs text-gray-500 mt-2">
                {user?.plan === 'free' ? `${1 - stats.websites} remaining` : 'Unlimited'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">AI Conversations</CardTitle>
              <Sparkles className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.chatMessages}</div>
              <p className="text-xs text-gray-500 mt-2">Messages with Eve AI</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/contacts">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Add New Contact
                </Button>
              </Link>
              <Link href="/dashboard/campaigns">
                <Button variant="outline" className="w-full justify-start">
                  <Megaphone className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              </Link>
              <Link href="/dashboard/websites">
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="mr-2 h-4 w-4" />
                  Build Website
                </Button>
              </Link>
              <Link href="/dashboard/ai">
                <Button variant="outline" className="w-full justify-start">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Chat with Eve AI
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Follow these steps to set up your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${stats.contacts > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {stats.contacts > 0 ? '✓' : '1'}
                </div>
                <div>
                  <p className="font-medium">Add your first contact</p>
                  <p className="text-sm text-gray-600">Import or manually add contacts to your CRM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${stats.campaigns > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {stats.campaigns > 0 ? '✓' : '2'}
                </div>
                <div>
                  <p className="font-medium">Create a campaign</p>
                  <p className="text-sm text-gray-600">Send your first email or SMS campaign</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${stats.websites > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {stats.websites > 0 ? '✓' : '3'}
                </div>
                <div>
                  <p className="font-medium">Build a website</p>
                  <p className="text-sm text-gray-600">Choose a template and customize your site</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {user?.plan === 'free' && (
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Upgrade to Pro</h3>
                    <p className="text-gray-600">Unlock unlimited contacts, websites, and premium features</p>
                  </div>
                </div>
                <Link href="/dashboard/settings">
                  <Button>
                    Upgrade Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
