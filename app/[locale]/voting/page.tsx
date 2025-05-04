import env from "@/env";
import { AVAIL_LOCALES, AvailableLocales } from "@/lib/constants";
import { FC } from "react";
import { LastVoteIdButton } from "./components/LastVoteIdButton";

type Props = {
  params: Promise<{ locale: string }>;
};

const Page: FC<Props> = async ({ params }) => {
  const { locale } = await params;
  const lang = (AVAIL_LOCALES.find((x) => x.startsWith(locale ?? "")) ??
    "cz-CZ") as AvailableLocales;
  return (
    <div className="w-screen h-screen justify-center items-center flex text-center flex-col gap-2">
      <LastVoteIdButton lang={lang} />
      {lang == "en-US" && (
        <>
          <p>
            For voting continue to the {env.NEXT_PUBLIC_API_URL}
            /en/voting/[voteId]
          </p>
          <p>Where [voteId] is your unique identification.</p>
        </>
      )}
      {lang == "cz-CZ" && (
        <>
          <p>
            Pro hlasování pokračujte na {env.NEXT_PUBLIC_API_URL}
            /cz/voting/[voteId]
          </p>
          <p>Kde [voteId] je váš unikátní identifikátor.</p>
        </>
      )}
    </div>
  );
};

export default Page;
