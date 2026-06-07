import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
        getAll() {
          return request.cookies.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Parse the current session session token securely
  const { data: { session } } = await supabase.auth.getSession();

  const url = request.nextUrl.clone();

  // If they are logged in and trying to go to the landing page or login gate, auto-route to dashboard
  if (session && (url.pathname === "/" || url.pathname === "/login")) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // If they are NOT logged in and trying to access the internal dashboard, bounce them to the gate
  if (!session && url.pathname.startsWith("/dashboard")) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

// Ensure the middleware strictly monitors your main routes
export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};