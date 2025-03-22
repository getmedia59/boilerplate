export type UserRole = 'user' | 'admin' | 'moderator'

export interface Profile {
  id: string
  updated_at: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
}

export interface ProfileFormData {
  full_name: string
  avatar_url: string
} 