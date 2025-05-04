import { NextResponse } from "next/server";
import { directusCashing } from "../utils/directusConst";
import { readItems } from "@directus/sdk";
import { filmFragment } from "@/types/directus-fragemnt";

export async function GET() {
  const data = await directusCashing.request(
    readItems("film", {
      fields: filmFragment.film,
    })
  );
  if (!data) {
    return NextResponse.error();
  }
  return NextResponse.json(data);
}
