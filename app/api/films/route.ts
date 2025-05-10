import { NextRequest, NextResponse } from "next/server";
import { directusCashing } from "../utils/directusConst";
import { readItems } from "@directus/sdk";
import { filmFragment } from "@/types/directus-fragemnt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import env from "@/env";

export async function GET(req: NextRequest) {
  const referer = req.headers.get("referer") || "";
  if (!referer.includes(env.NEXT_PUBLIC_URL)) {
    return NextResponse.json({ error: "Invalid referer" }, { status: 403 });
  }
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user?.role !== "user" && session.user?.role !== "admin")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let data;
  try {
    data = await directusCashing.request(
      readItems("film", {
        fields: filmFragment.film,
      })
    );
    if (!data) throw Error();
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error during data fetching." },
      { status: 400 }
    );
  }
  return NextResponse.json(data);
}
