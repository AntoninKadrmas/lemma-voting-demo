import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Skip API routes
  if (pathname.startsWith("/api")) return response;

  // Detect locale from pathname
  let locale: string;
  if (pathname.startsWith("/en")) {
    locale = "en-US";
  } else if (pathname.startsWith("/cz")) {
    locale = "cz-CZ";
  } else {
    // Fallback to cookie or default to cz-CZ
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

  // Redirect all invalid paths (including /, /en, /cz, or anything else)
  if (!isValidVotingPath) {
    return NextResponse.redirect(new URL(`/${lang}/voting`, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
