'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Loader2, Mic } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const samplePrompts = [
  'Draft an email campaign for my new product launch',
  'Analyze my contact list and suggest segmentation strategies',
  'Help me create content for my website homepage',
  'Suggest campaign ideas for the holiday season',
];

const mockResponses = [
  "I'd be happy to help you with that! Based on your business, here's a draft email campaign:\n\nSubject: Exciting New Product Launch - Just for You!\n\nHi [Name],\n\nWe're thrilled to announce the launch of our newest product that we think you'll love. As one of our valued customers, you get exclusive early access...",

  "Great question! Looking at your contact database, I recommend segmenting your contacts into these categories:\n\n1. Active Customers (purchased in last 90 days)\n2. Engaged Prospects (opened emails, visited website)\n3. Dormant Contacts (no interaction in 6+ months)\n\nWould you like me to help create targeted campaigns for each segment?",

  "Let me help you create compelling homepage content! Here's a structure:\n\nHero Section:\n- Headline: Transform Your Business with [Your Solution]\n- Subheadline: We help local businesses grow through digital marketing\n- CTA: Get Started Free\n\nFeatures Section:\n- List your top 3 unique benefits\n- Include customer testimonials\n- Show results/metrics\n\nWould you like me to expand on any section?",

  "Excellent timing! Here are some holiday campaign ideas tailored for local businesses:\n\n1. 12 Days of Deals - Daily special offers\n2. Holiday Gift Guide - Curated product recommendations\n3. Year-End Thank You - Appreciation campaign with special discount\n4. New Year, New You - Fresh start promotion in January\n\nWhich one would you like to develop further?",
];

export default function AIAssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: textToSend,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setThinking(true);

    try {
      await supabase.from('chat_messages').insert({
        user_id: user?.id,
        role: 'user',
        content: textToSend,
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

      const assistantMessage: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: randomResponse,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      await supabase.from('chat_messages').insert({
        user_id: user?.id,
        role: 'assistant',
        content: randomResponse,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="p-6 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Eve AI Assistant</h1>
              <p className="text-sm text-gray-600">Your intelligent marketing companion</p>
            </div>
            <Badge className="ml-auto" variant="secondary">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center space-y-6 mt-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Hi, I'm Eve!</h2>
                <p className="text-gray-600">
                  I'm your AI marketing assistant. I can help you draft campaigns, analyze data, create content, and more.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Try asking me:</p>
                <div className="grid gap-3">
                  {samplePrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSend(prompt)}
                      className="p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      <p className="text-sm text-gray-700">{prompt}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'assistant'
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                        : 'bg-gray-600'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <Sparkles className="h-5 w-5 text-white" />
                    ) : (
                      <span className="text-white font-semibold">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <Card
                    className={`flex-1 ${
                      message.role === 'user' ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}

              {thinking && (
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">Eve is thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Eve anything about your marketing..."
                disabled={thinking}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                disabled={thinking}
                onClick={() => toast.info('Voice input coming soon!')}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button onClick={() => handleSend()} disabled={thinking || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Eve is an AI assistant and may make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
