import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { ClerkMiddlewareAuth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/connect(.*)",
  "/profile(.*)",
  "/settings(.*)",
  "/advisor(.*)",
  "/onboarding(.*)",
]);

export default clerkMiddleware(async (auth: ClerkMiddlewareAuth, req: NextRequest) => {
  if (isProtectedRoute(req)) {
    await auth.protect();

    // Require beta invite code for all protected routes
    if (!req.cookies.get("cm_beta_access")) {
      return NextResponse.redirect(new URL("/invite", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
