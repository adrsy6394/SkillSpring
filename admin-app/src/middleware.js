import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // 🚫 Not logged in
  if (!session) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/instructor") ||
      pathname.startsWith("/dashboard")
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  }

  // ✅ Get role from JWT metadata (FAST)
  const role = session.user.user_metadata?.role;

  // Admin protection
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Instructor protection
  if (pathname.startsWith("/instructor") && role !== "instructor") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Student protection & Redirect
  if (pathname.startsWith("/dashboard")) {
    if (role === "student") {
      return NextResponse.redirect(new URL("https://skill-spring-ow1g.vercel.app/student/dashboard", request.url));
    }
    // If accessing dashboard but not a student
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/instructor/:path*",
    "/dashboard/:path*",
  ],
};
