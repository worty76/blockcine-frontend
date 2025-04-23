import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/register", "/"];
const protectedPaths = ["/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`Middleware processing: ${pathname}`);

  // Check if the path is protected or public
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  console.log(
    `Path type: ${
      isProtectedPath ? "protected" : isPublicPath ? "public" : "other"
    }`
  );

  // Get authentication token
  const authCookie = request.cookies.get("auth-storage");
  console.log(`Auth cookie present: ${!!authCookie}`);

  let isAuthenticated = false;
  let isAdmin = false;

  if (authCookie?.value) {
    try {
      const decodedValue = decodeURIComponent(authCookie.value);
      console.log("Decoded cookie value:", decodedValue);

      const parsedToken = JSON.parse(decodedValue);
      isAuthenticated = Boolean(parsedToken?.state?.isAuthenticated);
      isAdmin = Boolean(parsedToken?.state?.isAdmin);

      console.log(
        `Authentication status: ${
          isAuthenticated ? "authenticated" : "not authenticated"
        }`
      );
      console.log(`Admin status: ${isAdmin ? "admin" : "not admin"}`);
    } catch (error) {
      console.error("Error parsing auth token:", error);
    }
  }

  // Redirect admin users to dashboard from any public page
  if (isAdmin && isPublicPath && pathname !== "/dashboard") {
    console.log("Redirecting admin to dashboard from public page");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Handle protected routes access by non-authenticated users
  if (isProtectedPath && !isAuthenticated) {
    console.log("Redirecting to login: protected path requires authentication");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Handle dashboard access by non-admin users
  if (pathname.startsWith("/dashboard") && !isAdmin) {
    console.log("Redirecting to home: dashboard requires admin privileges");
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect authenticated users away from login page
  if (isAuthenticated && isPublicPath && pathname === "/login") {
    const redirectUrl = isAdmin ? "/dashboard" : "/";
    console.log(`Redirecting authenticated user from login to: ${redirectUrl}`);
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  console.log("Middleware completed: allowing request to proceed");
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Ensure this pattern correctly matches all the URLs you want to check
    "/((?!api|_next/static|_next/image|images|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
