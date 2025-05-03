import { buttonVariants } from "@/components/ui/button";
import { AvailableLocales } from "@/lib/constants";
import Link from "next/link";
import { FC, HTMLAttributes } from "react";

type LastVoteIdButtonProps = {
  className?: string;
  lang: AvailableLocales;
} & HTMLAttributes<HTMLOrSVGElement>;

export const LastVoteIdButton: FC<LastVoteIdButtonProps> = ({ lang }) => {
  const voteId = localStorage.getItem("voteId") || undefined;
  return (
    <>
      {voteId && lang == "en-US" && (
        <Link
          href={"/en/voting/" + voteId}
          className={buttonVariants({ variant: "outline" })}
        >
          Last working voting
        </Link>
      )}
      {voteId && lang == "cz-CZ" && (
        <Link
          href={"/cz/voting/" + voteId}
          className={buttonVariants({ variant: "outline" })}
        >
          Poslední funkční hlasování
        </Link>
      )}
    </>
  );
};
