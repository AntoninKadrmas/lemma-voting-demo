import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Skip API and Next.js internal routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return response;
  }

  // Allow explicitly valid paths
  const validStaticPaths = ["/en/login", "/en/admin", "/cz/login", "/cz/admin"];
  if (validStaticPaths.includes(pathname)) {
    return response;
  }

  // Detect locale from pathname
  let locale: string;
  if (pathname.startsWith("/en")) {
    locale = "en-US";
  } else if (pathname.startsWith("/cz")) {
    locale = "cz-CZ";
  } else {
    // Fallback to cookie or default
    locale = request.cookies.get("locale")?.value ?? "cz-CZ";
    return NextResponse.redirect(
      new URL(`/${locale.split("-")[0]}/voting`, request.url)
    );
  }

  // Set locale cookie
  response.cookies.set("locale", locale);
  const lang = locale.split("-")[0];

  const isValidVotingPath = new RegExp(`^/${lang}/voting(?:/[^/]+)?/?$`).test(
    pathname
  );

  if (!isValidVotingPath) {
    return NextResponse.redirect(new URL(`/${lang}/voting`, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
