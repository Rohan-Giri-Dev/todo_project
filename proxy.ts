import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(
  [
    '/',
    '/error-page',
    '/api/webhook/register',
    '/sign-in(.*)',
    '/sign-up(.*)',
  ]
)

// Only auth pages
const isAuthRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

// Admin-only pages
const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
]);


export default clerkMiddleware(async (auth, req) => {
 try {
   // userId tells if the user is logged in or not
   // sessionClaims contains user data like roles ="admim" | "user" 
   const {userId, sessionClaims} = await auth();
 
   // Get the user role from session claims
   // This will only work if you have added role inside Clerk metadata/session claims.
   const role = sessionClaims?.metadata?.role;
 
   // case 1
   // if user is logged in and tries to visit /sign-in or /signup
   if(userId && isAuthRoute(req)){
     if(role === 'admin'){
       return NextResponse.redirect(new URL("/admin/dashboard", req.url))
     }
 
       return NextResponse.redirect(new URL("/dashboard", req.url))
   }
 
   // CASE 2:
   // If the route is not public, protect it.
   // This means unauthenticated users cannot access routes like:
   // /dashboard, /admin/dashboard, /profile, etc.
 
   if(!isPublicRoute(req)){
     await auth.protect()
   }
 
   // CASE 3:
   // If the user is trying to access an admin route,
   // check whether the logged-in user's role is admin.
   // If not admin, redirect them to normal dashboard.
 
   if(isAdminRoute(req) && role !== 'admin'){
     return NextResponse.redirect(new URL('/dashboard', req.url))
   }
 } catch (error) {
    console.error(error)

    return NextResponse.redirect(new URL("/error-page", req.url))
 }

});



export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

/*
notes:
req
means:
The incoming request. It contains information like the URL, pathname, headers, cookies, etc.

sessionClaims contains extra information from the user’s session token
Example:
sessionClaims = {
  sub: "user_2abc123xyz",
  sid: "sess_2xyz456",
  metadata: {
    role: "admin"
  }
}

the req.url give the base url 
eg
req.url = "http://localhost:3000"
new URL("/dashboard", req.url)
http://localhost:3000/dashboard

*/
