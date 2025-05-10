import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { readItems } from "@directus/sdk";
import { directusNoCashing } from "../utils/directusConst";
import { authOptions } from "@/lib/authOptions";
import env from "@/env";
import { rateLimit } from "../utils/rateLimit";

export async function GET(req: NextRequest) {
  const referer = req.headers.get("referer") || "";
  if (!referer.includes(env.NEXT_PUBLIC_URL)) {
    return NextResponse.json({ error: "Invalid referer" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!rateLimit(session.user.id, "GET", new URL(req.url).pathname)) {
    return NextResponse.json(
      { error: "Too many requests wait a moment." },
      { status: 429 }
    );
  }

  try {
    const data = await directusNoCashing.request(
      readItems("vote", {
        fields: ["films"],
        limit: 10000,
      })
    );
    if (!data) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/vote error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
