import { NextResponse, type NextRequest } from "next/server";

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");

    const json = atob(payload);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard/auth/login";
      return NextResponse.redirect(url);
    }

    const payload = decodeJwtPayload(token);
    if (!payload || payload.role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard/auth/login";
      return NextResponse.redirect(url);
    }
  }

  // Protect /dashboard routes (excluding auth)
  if (pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/auth")) {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard/auth/login";
      return NextResponse.redirect(url);
    }

    const payload = decodeJwtPayload(token);
    if (!payload || payload.role !== "applicant") {
      // If admin tries to access talent dashboard, redirect to admin
      if (payload?.role === "admin") {
        const url = req.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }

      const url = req.nextUrl.clone();
      url.pathname = "/dashboard/auth/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
