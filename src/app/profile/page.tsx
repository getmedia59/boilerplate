'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
import { Container } from '@/components/ui/container'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // If profile doesn't exist, create one
      if (profileError && profileError.code === 'PGRST116') {
        const defaultProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          role: 'user',
          updated_at: new Date().toISOString(),
        }

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert(defaultProfile)
          .select()
          .single()

        if (insertError) {
          console.error('Error creating profile:', insertError)
          setError('Error creating profile')
          setLoading(false)
          return
        }

        profile = newProfile
      } else if (profileError) {
        console.error('Error loading profile:', profileError)
        setError('Error loading profile')
        setLoading(false)
        return
      }

      setProfile(profile)
      setFullName(profile.full_name || '')
      setAvatarUrl(profile.avatar_url || '')
    } catch (error) {
      console.error('Error loading profile:', error)
      setError('Error loading profile')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Clear messages
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const updates = {
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(updates)

      if (updateError) {
        throw updateError
      }

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName, avatar_url: avatarUrl }
      })

      if (authError) {
        throw authError
      }

      // Update local state
      setProfile(prev => {
        if (prev) {
          return {
            ...prev,
            full_name: fullName,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          }
        }
        return prev
      })

      setSuccess('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <div className="py-10 text-center">Loading...</div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your profile information
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
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
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Enter avatar URL"
                />
              </div>
              {profile && (
                <div className="text-sm text-gray-500">
                  Role: {profile.role}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={saving}
                className="ml-auto"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Container>
  )
} 