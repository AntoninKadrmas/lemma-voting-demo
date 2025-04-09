import { NextRequest, NextResponse } from "next/server";
import { readItem, triggerFlow } from "@directus/sdk";
import { directus } from "../../utils/directusConst";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop()!;
  const data = await directus.request(readItem("vote", id));
  if (!data) {
    return NextResponse.error();
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  interface TriggerFlowResponse {
    error?: string;
    [key: string]: any;
  }

  const data: TriggerFlowResponse = (await directus.request(
    triggerFlow("POST", "f2b48e63-1368-4324-ac9c-09f26c70be0c", body)
  )) as TriggerFlowResponse;

  if (!data || data.error) {
    return NextResponse.error();
  }
  return NextResponse.json(data);
}
