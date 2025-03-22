'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/lib/hooks';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Profile } from '@/types';

export default function AdminUsers() {
  const router = useRouter();
  const { profile: currentProfile, loading, isAdmin } = useProfile();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
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

  useEffect(() => {
    const loadUsers = async () => {
      if (!authChecked) return;
      
      try {
        setLoadingUsers(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        setUsers(data as Profile[]);
      } catch (error) {
        console.error('Error loading users:', error);
        setError('Failed to load users');
      } finally {
        setLoadingUsers(false);
      }
    };

    if (authChecked && isAdmin) {
      loadUsers();
    }
  }, [authChecked, isAdmin]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, role: newRole as 'user' | 'admin' | 'moderator' };
        }
        return user;
      }));
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role');
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
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <Button onClick={() => router.push('/admin')}>Back to Dashboard</Button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 rounded-md p-4 mb-6">
            <div className="text-sm">{error}</div>
          </div>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <p>Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.avatar_url ? (
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={user.avatar_url}
                                  alt=""
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  {user.full_name?.charAt(0) || '?'}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.full_name || 'Unnamed User'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                            user.role === 'moderator' ? 'bg-blue-100 text-blue-800' : 
                            'bg-green-100 text-green-800'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.updated_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.id !== currentProfile?.id && (
                            <div className="flex space-x-2">
                              {user.role !== 'admin' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateRole(user.id, 'admin')}
                                >
                                  Make Admin
                                </Button>
                              )}
                              {user.role !== 'user' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateRole(user.id, 'user')}
                                >
                                  Make User
                                </Button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
} 