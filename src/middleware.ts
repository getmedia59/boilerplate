import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Create a response to modify later if needed
  const response = NextResponse.next();
  
  // We're temporarily disabling the middleware to test direct client-side authentication
  console.log("Middleware bypassed for debugging");
  return response;
  
  /*
  // Rest of middleware commented out for debugging
  try {
    // Create a Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("Session check:", session ? "Session exists" : "No session");

    // For admin routes, verify user has admin role
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!session) {
        console.log('No session found, redirecting to login');
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

      // Get user profile to check role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.redirect(new URL('/', request.url));
      }

      console.log('User profile:', profile);

      if (!profile || profile.role !== 'admin') {
        console.log('User is not an admin, redirecting to home');
        return NextResponse.redirect(new URL('/', request.url));
      }

      console.log('Admin access granted to', session.user.email);
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // If there's an error, still allow the request to proceed
    // but redirect admin routes to home for safety
    if (request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return response;
  }
  */
}

// Only run middleware on these paths
export const config = {
  matcher: ['/admin/:path*'],
}; 