import { NextRequest, NextResponse } from "next/server";
import { readItem, updateItem } from "@directus/sdk";
import { directus } from "../../utils/directusConst";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop()!;
  const data = await directus.request(readItem("vote", id));
  if (!data) {
    return NextResponse.json(
      { error: "Error during users film fetching." },
      { status: 400 }
    );
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop()!;
  const body = await req.json();
  const data = await directus.request(
    updateItem("vote", id, {
      films: body.films,
    })
  );
  if (!data) {
    return NextResponse.json(
      { error: "Error during users films inserting" },
      { status: 400 }
    );
  }
  return NextResponse.json(data);
}
