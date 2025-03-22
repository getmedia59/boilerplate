'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminSettings() {
  const router = useRouter();
  const { loading, isAdmin } = useProfile();
  const [siteTitle, setSiteTitle] = useState('Your App');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Direct auth check to avoid middleware issues
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          router.push('/auth/login');
          return;
        }
        
        // Get user profile directly
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error("Error fetching profile:", error);
          router.push('/');
          return;
        }
        
        if (!profile || profile.role !== 'admin') {
          console.log("User is not admin, redirecting to home");
          router.push('/');
          return;
        }
        
        setAuthChecked(true);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push('/');
      }
    };
    
    if (!loading && !isAdmin) {
      checkAuth();
    } else if (!loading && isAdmin) {
      setAuthChecked(true);
    }
  }, [loading, isAdmin, router]);

  // This is a placeholder function since we don't have a settings table yet
  // In a real application, you would save these to your database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would save to your database here
      
      setSuccess('Settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !authChecked) {
    return (
      <Container>
        <div className="py-10 text-center">Loading...</div>
      </Container>
    );
  }

  if (!isAdmin) {
    return null; // Router will handle redirect
  }

  return (
    <Container>
      <div className="py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <Button onClick={() => router.push('/admin')}>Back to Dashboard</Button>
        </div>
        
        <Card className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 rounded-md p-4">
                  <div className="text-sm">{error}</div>
                </div>
              )}
              {success && (
                <div className="bg-green-50 text-green-700 rounded-md p-4">
                  <div className="text-sm">{success}</div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input
                  id="siteTitle"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  placeholder="Enter site title"
                />
              </div>
              
              <div className="border-t pt-4 mt-4">
                <CardTitle className="text-lg mb-4">Advanced Settings</CardTitle>
                <p className="text-gray-500 text-sm mb-4">
                  These settings are placeholders. In a real application, you would
                  implement functionality to manage these settings.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Button variant="outline" className="w-full" disabled>
                      Clear Cache
                    </Button>
                  </div>
                  <div>
                    <Button variant="outline" className="w-full" disabled>
                      Update Indexes
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={saving}
                className="ml-auto"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Container>
  );
} 