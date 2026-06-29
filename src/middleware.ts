import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/", "/login", "/signup"];

const ROLE_ROUTES: Record<string, string[]> = {
  "/citizens": ["village_staff", "village_chief", "district_officer", "administrator"],
  "/citizens/register": ["village_staff", "village_chief", "district_officer", "administrator"],
  "/residency": ["village_chief", "district_officer"],
  "/land": ["village_staff", "village_chief", "district_officer", "administrator"],
  "/land/register": ["village_staff", "village_chief", "district_officer", "administrator"],
  "/animals": ["village_staff", "village_chief", "district_officer", "administrator"],
  "/animals/register": ["village_staff", "village_chief", "district_officer", "administrator"],
  "/disputes/file": ["citizen", "village_staff", "village_chief", "district_officer", "administrator"],
  "/reports": ["village_chief", "district_officer", "administrator"],
  "/users": ["administrator"],
  "/role-requests": ["administrator"],
  "/settings": ["administrator"],
  "/audit-logs": ["administrator", "district_officer"],
};

function redirectTo(request: NextRequest, pathname: string, response: NextResponse) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const redirect = NextResponse.redirect(url);
  // Preserve any refreshed auth cookies on the redirect response.
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const { supabase, response } = updateSession(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (!user) {
    return isPublic ? response : redirectTo(request, "/login", response);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    return redirectTo(request, "/dashboard", response);
  }

  // Authenticated user is allowed on public routes (no role check needed).
  if (isPublic) return response;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role as string | undefined;

  for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      if (!role || !allowedRoles.includes(role)) {
        return redirectTo(request, "/dashboard", response);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
