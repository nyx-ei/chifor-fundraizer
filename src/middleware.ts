import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { type CookieOptions, createServerClient } from '@supabase/ssr';

import { type Locale, routing } from '@/i18n/routing';
import { publicEnv } from '@/lib/env/public-env';

const handleI18nRouting = createMiddleware(routing);
const localeSet = new Set<string>(routing.locales);

function hasLocalePrefix(pathname: string): boolean {
  const firstSegment = pathname.split('/')[1];
  return firstSegment !== undefined && localeSet.has(firstSegment);
}

function localeFromPath(pathname: string): Locale {
  const firstSegment = pathname.split('/')[1];

  if (firstSegment !== undefined && localeSet.has(firstSegment)) {
    return firstSegment as Locale;
  }

  return routing.defaultLocale;
}

function pathWithoutLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment !== undefined && localeSet.has(firstSegment)) {
    const rest = segments.slice(1).join('/');
    return rest.length > 0 ? `/${rest}` : '/';
  }

  return pathname;
}

function isPublicPath(pathname: string): boolean {
  return pathname === '/' || pathname === '/register' || pathname.startsWith('/auth/');
}

function localizedPath(locale: Locale, pathname: string): string {
  return `/${locale}${pathname === '/' ? '' : pathname}`;
}

function preferredLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;

  if (cookieLocale !== undefined && localeSet.has(cookieLocale)) {
    return cookieLocale as Locale;
  }

  const acceptedLocales = (request.headers.get('accept-language') ?? '')
    .split(',')
    .map((part) => {
      const [rawTag, rawQuality] = part.trim().split(';q=');
      const primaryTag = rawTag?.toLowerCase().split('-')[0] ?? '';
      const quality = rawQuality === undefined ? 1 : Number.parseFloat(rawQuality);

      return {
        locale: primaryTag,
        quality: Number.isFinite(quality) ? quality : 0
      };
    })
    .sort((left, right) => right.quality - left.quality);

  for (const acceptedLocale of acceptedLocales) {
    if (localeSet.has(acceptedLocale.locale)) {
      return acceptedLocale.locale as Locale;
    }
  }

  return routing.defaultLocale;
}

function shouldRedirectToPreferredLocale(pathname: string): boolean {
  return !hasLocalePrefix(pathname) && pathname !== '/sw';
}

export default async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/sw') {
    return NextResponse.next();
  }

  if (shouldRedirectToPreferredLocale(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = localizedPath(preferredLocale(request), request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  let response = handleI18nRouting(request);
  const locale = localeFromPath(request.nextUrl.pathname);
  const protectedPath = pathWithoutLocale(request.nextUrl.pathname);

  const supabase = createServerClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL, publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response.cookies.set({ name, value: '', ...options });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (isPublicPath(protectedPath)) {
    return response;
  }

  if (protectedPath.startsWith('/dashboard') && user === null) {
    const loginUrl = new URL(localizedPath(locale, '/auth/login'), request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (protectedPath.startsWith('/admin')) {
    if (user === null) {
      const loginUrl = new URL(localizedPath(locale, '/auth/login'), request.url);
      loginUrl.searchParams.set('next', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: isPlatformAdmin, error: roleError } = await supabase.rpc('has_role', {
      required_role: 'platform_admin'
    });

    if (roleError || isPlatformAdmin !== true) {
      return NextResponse.redirect(new URL(localizedPath(locale, '/dashboard'), request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|sw$|.*\\..*).*)']
};
