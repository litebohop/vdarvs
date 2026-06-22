import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login"];

const ROLE_ROUTES: Record<string, string[]> = {
  "/citizens": ["village_staff", "village_chief", "district_officer", "administrator"],
  "/citizens/register": ["village_staff", "village_chief", "district_officer", "administrator"],
  "/residency": ["village_chief", "district_officer", "administrator"],
  "/land": ["village_staff", "village_chief", "district_officer", "administrator"],
  "/animals": ["village_staff", "village_chief", "district_officer", "administrator"],
  "/reports": ["village_chief", "district_officer", "administrator"],
  "/users": ["administrator"],
  "/settings": ["administrator"],
  "/audit-logs": ["administrator", "district_officer"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  const role = request.cookies.get("vdarvs-role")?.value;

  if (!role && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      if (role && !allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
