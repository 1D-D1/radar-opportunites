import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cri.1d-d1.io';
  const pathname = request.nextUrl.pathname;

  // Protected routes (require auth)
  const protectedPaths = ['/dashboard', '/settings', '/scan', '/onboarding'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected && !user) {
    const loginUrl = new URL(`${appUrl}/auth/login`);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Onboarding redirect: if user is logged in and hasn't completed onboarding,
  // redirect to /onboarding (except if they're already there)
  if (user && !pathname.startsWith('/onboarding') && !pathname.startsWith('/auth') && !pathname.startsWith('/api')) {
    const needsOnboardingCheck = ['/dashboard', '/settings', '/scan'].some(p => pathname.startsWith(p));

    if (needsOnboardingCheck) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        // Only redirect if column exists and is explicitly false
        if (profile && profile.onboarding_completed === false) {
          return NextResponse.redirect(new URL(`${appUrl}/onboarding`));
        }
      } catch {
        // If column doesn't exist yet (migration not run), skip onboarding check
      }
    }
  }

  // Redirect logged-in users from login page
  if (pathname === '/auth/login' && user) {
    return NextResponse.redirect(new URL(`${appUrl}/dashboard`));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/scan/:path*', '/auth/login', '/onboarding/:path*'],
};
