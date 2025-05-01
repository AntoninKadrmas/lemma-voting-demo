import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();

  // Skip API routes
  if (pathname.startsWith("/api")) return response;

  // Detect locale from pathname
  let locale: string | undefined;
  if (pathname.startsWith("/en")) {
    locale = "en-US";
  } else if (pathname.startsWith("/cz")) {
    locale = "cz-CZ";
  } else {
    // Fallback: from cookie or default to cz
    locale = request.cookies.get("locale")?.value ?? "cz-CZ";
    return NextResponse.redirect(
      new URL(`/${locale.split("-")[0]}`, request.url)
    );
  }

  // Set locale cookie
  response.cookies.set("locale", locale);
  const lang = locale.split("-")[0]; // "en" or "cz"

  // Handle voteId in the path
  const votingMatch = pathname.match(/^\/(cz|en)\/voting(?:\/([^\/]+))?\/?$/);
  const voteIdFromPath = votingMatch?.[2];

  // Save voteId to cookie if present in path
  if (voteIdFromPath) {
    response.cookies.set("voteId", voteIdFromPath);
    return response;
  }

  const voteIdFromCookie = request.cookies.get("voteId")?.value;

  // Allow exact access to /[lang]/voting (no redirect)
  const isVotingRoot =
    pathname === `/${lang}/voting` || pathname === `/${lang}/voting/`;

  // If path is not voting root and voteId exists in cookie, redirect to voting with voteId
  if (!isVotingRoot && voteIdFromCookie) {
    const isBaseLangPath = pathname === `/${lang}` || pathname === `/${lang}/`;
    const isInvalidVotingPath = !/^\/(cz|en)(\/voting(\/[^\/]+)?)?\/?$/.test(
      pathname
    );

    if (isBaseLangPath || isInvalidVotingPath) {
      return NextResponse.redirect(
        new URL(`/${lang}/voting/${voteIdFromCookie}`, request.url)
      );
    }
  }

  // Final validation: only allow /[lang], /[lang]/voting, /[lang]/voting/[voteId]
  const isValidPath = /^\/(cz|en)(\/voting(\/[^\/]+)?)?\/?$/.test(pathname);
  if (!isValidPath) {
    return NextResponse.redirect(new URL(`/${lang}/voting`, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
