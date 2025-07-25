import { NextResponse } from "next/server";

export function middleware(request) {
  // Get the Firebase Auth token from cookies
  const token = request.cookies.get("firebase-auth-token")?.value;
  const { pathname } = request.nextUrl;

  // For SPA, we only need to protect the root path if no token exists
  // Since you're handling routing client-side, we just need to ensure
  // the user is authenticated to access the app

  if (pathname === "/" && !token) {
    // Allow access to show login screen
    return NextResponse.next();
  }

  // If there are specific protected routes you want to handle server-side
  const protectedPaths = ["/dashboard", "/profile"];
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtectedPath && !token) {
    // Redirect to home with login
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
