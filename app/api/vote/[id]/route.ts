import { NextRequest, NextResponse } from "next/server";
import { readItem, updateItem } from "@directus/sdk";
import { directusNoCashing } from "../../utils/directusConst";
import { voteFragment } from "@/types/directus-fragemnt";
import moment from "moment";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop()!;
    const data = await directusNoCashing.request(
      readItem("vote", id, {
        fields: voteFragment.vote,
      })
    );
    if (!data) {
      return NextResponse.error();
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("POST /api/vote/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  let voting;
  try {
    voting = await directusNoCashing.request(
      readItem("vote", body.voteId, {
        fields: ["voting_id.end_date", "voting_id.films.film_id"],
      })
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid vote id." }, { status: 500 });
  }

  const endDate = voting.voting_id.end_date;
  const validFilmIds = new Set(
    (voting.voting_id.films ?? []).map(
      (film: { film_id: number }) => film.film_id
    )
  );

  const userFilmIds = new Set(JSON.parse(body.films ?? "[]"));

  if (userFilmIds.size > validFilmIds.size) {
    return NextResponse.json(
      { error: "Too many film IDs submitted." },
      { status: 500 }
    );
  }

  for (const id of userFilmIds) {
    if (validFilmIds.has(id)) {
      return NextResponse.json(
        { error: `Invalid film ID: ${id}` },
        { status: 500 }
      );
    }
  }

  // Check voting deadline
  if (moment().isAfter(endDate)) {
    return NextResponse.json(
      { error: "Voting has already ended." },
      { status: 500 }
    );
  }

  let response;
  try {
    response = await directusNoCashing.request(
      updateItem("vote", body.voteId, {
        films: JSON.stringify([...userFilmIds]),
      })
    );
  } catch (error) {
    console.error("POST /api/vote/[id] error:", error);
    return NextResponse.json(
      { error: "Error during vote updating." },
      { status: 500 }
    );
  }

  if (typeof response !== "object" || response === null) {
    return NextResponse.json(
      { error: "Unexpected response format server." },
      { status: 500 }
    );
  }

  const data = response as { error?: string; [key: string]: unknown };

  if (data.error) {
    return NextResponse.json({ error: data.error }, { status: 500 });
  }

  return NextResponse.json(data);
}
