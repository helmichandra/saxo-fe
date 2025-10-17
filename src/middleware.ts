import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {

  const sessionId = request.cookies.get("sessionId")?.value;
  const roleId = request.cookies.get("roleId")?.value;

  const url = request.nextUrl.clone();

  if (url.pathname === "/auth/recovery") {
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  if (
    sessionId &&
    (url.pathname === "/auth/signin" ||
      url.pathname === "/auth/signup" ||
      url.pathname === "/auth/code-register")
  ) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (!sessionId && url.pathname.startsWith("/dashboard")) {
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  if ((url.pathname === "/dashboard/markets" || url.pathname === "/dashboard") && (roleId === "777" || roleId === "555")) {
    url.pathname = "/dashboard/users";
    return NextResponse.redirect(url);
  }

  if ((url.pathname === "/dashboard" || url.pathname === "/dashboard") && (roleId === "1" || roleId === "")) {
    url.pathname = "/dashboard/markets";
    return NextResponse.redirect(url);
  }


  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/auth/signin",      
    "/auth/signup",
    "/auth/code-register",
    "/auth/recovery",
  ],
};

// List URL
// /auth/signin
// /auth/signup
// /auth/code-register
// /dashboard/requests
// /dashboard/markets
// /dashboard/users
// /dashboard/banks
// /dashboard/transactions
// /dashboard/portofolios
