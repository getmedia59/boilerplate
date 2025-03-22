'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/lib/hooks';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const router = useRouter();
  const { profile, loading, isAdmin, user } = useProfile();
  const [userCount, setUserCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
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

  useEffect(() => {
    const loadStats = async () => {
      if (!authChecked) return;
      
      try {
        // Count total users
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        setUserCount(count || 0);
      } catch (error) {
        console.error('Error loading admin stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (authChecked && isAdmin) {
      loadStats();
    }
  }, [authChecked, isAdmin]);

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
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Total registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {loadingStats ? '...' : userCount}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>User administration</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/admin/users')}
                className="w-full"
              >
                View All Users
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>Configure application settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/admin/settings')}
                className="w-full"
                variant="outline"
              >
                Manage Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
} 