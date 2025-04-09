import { NextResponse } from "next/server";
import { directus } from "../utils/directusConst";
import { readItems } from "@directus/sdk";

export async function GET() {
  const data = await directus.request(readItems("film"));
  if (!data) {
    return NextResponse.error();
  }
  return NextResponse.json(data);
}
