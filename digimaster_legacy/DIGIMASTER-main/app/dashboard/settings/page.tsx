'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, CreditCard, Zap, Key, Users as UsersIcon, Check, Crown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: profileData.name,
        })
        .eq('id', user?.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
      await refreshUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = (plan: string) => {
    toast.info(`Upgrade to ${plan} - Payment processing coming soon!`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="h-4 w-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Zap className="h-4 w-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="api">
              <Key className="h-4 w-4 mr-2" />
              API Keys
            </TabsTrigger>
            {user?.plan === 'agency' && (
              <TabsTrigger value="team">
                <UsersIcon className="h-4 w-4 mr-2" />
                Team
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profileData.email} disabled />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Account Created</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(user?.created_at || '').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>Manage your subscription</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-lg capitalize">{user?.plan} Plan</h3>
                      <p className="text-sm text-gray-600">
                        {user?.plan === 'free' && 'Limited features'}
                        {user?.plan === 'pro' && '$97/month - Unlimited features'}
                        {user?.plan === 'agency' && '$297/month - Agency features'}
                      </p>
                    </div>
                    <Badge>
                      {user?.plan === 'free' ? 'Free' : 'Active'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {user?.plan !== 'agency' && (
                <div className="grid md:grid-cols-2 gap-6">
                  {user?.plan === 'free' && (
                    <Card className="border-blue-600 border-2">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Pro Plan</CardTitle>
                          <Badge>Popular</Badge>
                        </div>
                        <div className="mt-4">
                          <span className="text-3xl font-bold">$97</span>
                          <span className="text-gray-600">/month</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Unlimited contacts</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Unlimited websites</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Email & SMS campaigns</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Custom domains</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Priority support</span>
                          </div>
                        </div>
                        <Button className="w-full" onClick={() => handleUpgrade('Pro')}>
                          Upgrade to Pro
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Agency Plan</CardTitle>
                        <Crown className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">$297</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>Everything in Pro</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>Up to 10 team members</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>White-label options</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>API access</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>Dedicated support</span>
                        </div>
                      </div>
                      <Button className="w-full" variant="outline" onClick={() => handleUpgrade('Agency')}>
                        Upgrade to Agency
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Connect your favorite tools and services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {['Google', 'Facebook', 'Stripe', 'Mailchimp', 'Zapier'].map((integration) => (
                  <div key={integration} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{integration}</h3>
                      <p className="text-sm text-gray-600">Connect your {integration} account</p>
                    </div>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage your API keys for integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Label className="text-xs text-gray-600">API Key</Label>
                    <div className="flex gap-2 mt-2">
                      <Input value="dm_xxxxxxxxxxxxxxxxxxxx" disabled />
                      <Button variant="outline">Copy</Button>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> API access is available on Agency plan only.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user?.plan === 'agency' && (
            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage your team and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No team members yet</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Invite team members to collaborate on your projects
                    </p>
                    <Button>
                      <UsersIcon className="h-4 w-4 mr-2" />
                      Invite Team Member
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
