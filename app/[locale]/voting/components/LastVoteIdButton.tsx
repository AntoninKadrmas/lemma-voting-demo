"use client";
import { buttonVariants } from "@/components/ui/button";
import { AvailableLocales } from "@/lib/constants";
import Link from "next/link";
import { FC, HTMLAttributes, useEffect, useState } from "react";

type LastVoteIdButtonProps = {
  className?: string;
  lang: AvailableLocales;
} & HTMLAttributes<HTMLOrSVGElement>;

export const LastVoteIdButton: FC<LastVoteIdButtonProps> = ({ lang }) => {
  const [voteId, setVoteId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const storedVoteId = localStorage.getItem("voteId");
    if (storedVoteId) {
      setVoteId(storedVoteId);
    }
  }, []);

  if (!voteId) return null;

  const href =
    lang === "cz-CZ" ? `/cz/voting/${voteId}` : `/en/voting/${voteId}`;
  const label =
    lang === "cz-CZ" ? "Poslední funkční hlasování" : "Last working voting";

  return (
    <Link href={href} className={buttonVariants({ variant: "outline" })}>
      {label}
    </Link>
  );
};
