import { NextRequest, NextResponse } from "next/server";
import { directus } from "../utils/directusConst";
import { readItems } from "@directus/sdk";

export async function GET(req: NextRequest) {
  const data = await directus.request(readItems("film"));
  if (!data) {
    return NextResponse.json({ error: "Error during all film fetching" }, { status: 400 });
  }
  return NextResponse.json(data);
}
