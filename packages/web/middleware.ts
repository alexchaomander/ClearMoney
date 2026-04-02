import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { ClerkMiddlewareAuth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const DEMO_COOKIE = "cm_demo_mode";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/connect(.*)",
  "/profile(.*)",
  "/settings(.*)",
  "/advisor(.*)",
  "/onboarding(.*)",
]);

export default clerkMiddleware(async (auth: ClerkMiddlewareAuth, req: NextRequest) => {
  const demoModeEnabled = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const demoParam = req.nextUrl.searchParams.get("demo");
  const hasDemoCookie = req.cookies.get(DEMO_COOKIE)?.value === "true";
  const isDemoRequest =
    demoModeEnabled && (demoParam === "true" || (demoParam !== "false" && hasDemoCookie));
  const response = NextResponse.next();

  if (demoModeEnabled) {
    if (demoParam === "true") {
      response.cookies.set(DEMO_COOKIE, "true", {
        httpOnly: false,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    } else if (demoParam === "false") {
      response.cookies.delete(DEMO_COOKIE);
    }
  }

  if (isDemoRequest) {
    return response;
  }

  if (isProtectedRoute(req)) {
    await auth.protect();

    // Require beta invite code for all protected routes
    if (!req.cookies.get("cm_beta_access")) {
      return NextResponse.redirect(new URL("/invite", req.url));
    }
  }

  return response;
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
