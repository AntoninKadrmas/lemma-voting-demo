import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { readItems } from "@directus/sdk";
import { directusNoCashing } from "../utils/directusConst";

export async function GET() {
  console.log("Ahoj");
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const data = await directusNoCashing.request(
      readItems("vote", {
        fields: ["films"],
      })
    );
    console.log("here", data);
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
