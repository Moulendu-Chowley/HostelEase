import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const adminOnlyRoutes = [
  "/dashboard/rooms",
  "/dashboard/allotment",
  "/dashboard/students",
  "/dashboard/mess",
  "/dashboard/events",
  "/dashboard/budget",
  "/dashboard/complaints",
  "/dashboard/settings",
];

export async function middleware(request: NextRequest) {
  const supabaseUrl = getSupabaseUrl();
  const supabasePublishableKey = getSupabasePublishableKey();

  if (!supabaseUrl || !supabasePublishableKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  let user = null;
  try {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();
    if (!authError) {
      user = authUser;
    }
  } catch (err) {
    console.warn("Middleware: auth check fetch failed, treating as unauthenticated.", err);
  }

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isLoginRoute = request.nextUrl.pathname === "/login";
  const isSignupRoute = request.nextUrl.pathname === "/signup";

  if (!user && isDashboardRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && (isLoginRoute || isSignupRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isDashboardRoute) {
    const role = String(user.user_metadata?.role || "student").toLowerCase();

    const needsAdmin = adminOnlyRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route),
    );

    if (needsAdmin && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/attendance";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
