"use client";
import Html5QrcodePlugin from "@/components/element/Html5QrcodePlugin";
import env from "@/env";
import { AvailableLocales } from "@/lib/constants";
import { usePathname, useRouter } from "next/navigation";
import { FC, useState } from "react";
import { LuLoader } from "react-icons/lu"; // Optional: a nice loading icon

type Html5QrcodeWrapperProps = {
  lang: AvailableLocales;
};

const Html5QrcodeWrapper: FC<Html5QrcodeWrapperProps> = ({ ...props }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const checkUrl = `${env.NEXT_PUBLIC_API_URL.replace("/api", "")}/voting/`;

  const onNewScanResult = (decodedText: string) => {
    if (decodedText.startsWith(checkUrl)) {
      const voteId = decodedText.split(checkUrl)[1];
      setIsRedirecting(true); // Start loading
      setTimeout(() => {
        router.push(`${pathname}/${voteId}`);
      }, 300); // optional short delay
    }
  };

  return (
    <>
      {isRedirecting ? (
        <div className="flex flex-col items-center justify-center aspect-square w-screen max-w-[600px]">
          <LuLoader className="animate-spin w-10 h-10 mb-4" />
          <p className="text-center font-semibold">Redirecting to vote...</p>
        </div>
      ) : (
        <Html5QrcodePlugin
          key={props.lang}
          fps={10}
          lang={props.lang}
          disableFlip={false}
          qrCodeSuccessCallback={onNewScanResult}
          qrCodeErrorCallback={(errorMessage) => {
            console.log(errorMessage);
          }}
        />
      )}
    </>
  );
};

export default Html5QrcodeWrapper;
