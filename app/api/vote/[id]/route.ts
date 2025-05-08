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
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
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

type VoteData = {
  voting_id: {
    end_date: string;
    films: { film_id: number }[];
  };
};

type VoteCacheEntry = {
  data: VoteData;
  expiresAt: number;
};

const voteCache = new Map<string, VoteCacheEntry>();
const CACHE_TTL_MS = 60_000;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const voteId = req.nextUrl.pathname.split("/").pop()!;

  if (!voteId) {
    return NextResponse.json({ error: "Missing vote ID." }, { status: 400 });
  }

  // --- CACHE LAYER ---
  let voting: VoteData;
  const now = Date.now();
  const cached = voteCache.get(voteId);

  if (cached && cached.expiresAt > now) {
    voting = cached.data;
  } else {
    try {
      voting = await directusNoCashing.request<VoteData>(
        readItem("vote", voteId, {
          fields: ["voting_id.end_date", "voting_id.films.film_id"],
        })
      );
      voteCache.set(voteId, {
        data: voting,
        expiresAt: now + CACHE_TTL_MS,
      });
    } catch (error) {
      console.error("Error fetching vote data:", error);
      return NextResponse.json({ error: "Invalid vote ID." }, { status: 500 });
    }
  }

  // --- VALIDATION ---
  const endDate = voting.voting_id.end_date;
  const validFilmIds = new Set(
    (voting.voting_id.films ?? []).map(
      (film: { film_id: number }) => film.film_id
    )
  );

  let userFilmIds: Set<number>;
  try {
    userFilmIds = new Set(body.films); // Assume body.films is already an array
  } catch {
    return NextResponse.json({ error: "Invalid film data." }, { status: 400 });
  }

  if (userFilmIds.size > validFilmIds.size) {
    return NextResponse.json(
      { error: "Too many film IDs submitted." },
      { status: 400 }
    );
  }

  for (const id of userFilmIds) {
    if (!validFilmIds.has(id)) {
      return NextResponse.json(
        { error: `Invalid film ID: ${id}` },
        { status: 400 }
      );
    }
  }

  if (moment().isAfter(endDate)) {
    return NextResponse.json(
      { error: "Voting has already ended." },
      { status: 400 }
    );
  }

  // --- VOTE SUBMISSION ---
  let response;
  try {
    response = await directusNoCashing.request(
      updateItem("vote", voteId, {
        films: JSON.stringify([...userFilmIds]),
      })
    );
  } catch (error) {
    console.error("POST /api/vote error:", error);
    return NextResponse.json(
      { error: "Error updating vote." },
      { status: 500 }
    );
  }

  if (!response || typeof response !== "object") {
    return NextResponse.json(
      { error: "Unexpected server response." },
      { status: 500 }
    );
  }

  return NextResponse.json(response);
}
