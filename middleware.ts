// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();

  // Skip API routes
  if (pathname.startsWith("/api")) return response;

  let locale: string | undefined;

  if (pathname.startsWith("/en")) {
    locale = "en-US";
  } else if (pathname.startsWith("/cz")) {
    locale = "cz-CZ";
  } else {
    // Get the locale from cookies or default to 'cz-CZ'
    locale = request.cookies.get("locale")?.value ?? "cz-CZ";
    return NextResponse.redirect(
      new URL(`/${locale.split("-")[0]}`, request.url)
    );
  }

  // Set the locale cookie in the response
  response.cookies.set("locale", locale);

  const isValidPath = /^\/(en|cz)(\/voting)?\/?$/.test(pathname);
  console.log("isValidPath", isValidPath, pathname);
  if (!isValidPath) {
    return NextResponse.redirect(
      new URL(`/${locale.split("-")[0]}`, request.url)
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
