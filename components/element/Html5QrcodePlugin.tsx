"use client";
import { cn } from "@/lib/utils";
import { Html5Qrcode } from "html5-qrcode";
import { FC, useEffect, useRef, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { Html5QrcodeResult } from "html5-qrcode/esm/core";
import { Html5QrcodeCameraScanConfig } from "html5-qrcode/esm/html5-qrcode";

const qrcodeRegionId = "html5qr-code-full-region";

interface Html5QrcodePluginProps {
  lang: "en-US" | "cz-CZ";
  fps?: number;
  aspectRatio?: number;
  disableFlip?: boolean;
  qrCodeSuccessCallback: (
    decodedText: string,
    result: Html5QrcodeResult
  ) => void;
  qrCodeErrorCallback: (error: string) => void;
}

const Html5QrcodePlugin: FC<Html5QrcodePluginProps> = ({ ...props }) => {
  const html5QrRef = useRef<Html5Qrcode | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const qrboxFunction = function (
    viewfinderWidth: number,
    viewfinderHeight: number
  ) {
    console.log(viewfinderHeight, viewfinderWidth);
    const minEdgePercentage = 0.9; // 70%
    const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
    const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
    return {
      width: qrboxSize,
      height: qrboxSize,
    };
  };

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        // Stop existing scanner if any
        if (html5QrRef.current) {
          await html5QrRef.current.stop();
          await html5QrRef.current.clear();
          html5QrRef.current = null;
        }

        const scannerRegion = document.getElementById(qrcodeRegionId);
        if (scannerRegion) scannerRegion.innerHTML = "";

        const devices = await Html5Qrcode.getCameras();
        if (!isMounted) return;

        if (devices && devices.length) {
          const config: Html5QrcodeCameraScanConfig = {
            fps: props.fps ?? 10,
            qrbox: qrboxFunction,
            aspectRatio: props.aspectRatio ?? 1.0,
            disableFlip: props.disableFlip ?? false,
          };

          const backCamera = devices.find((d) =>
            /back|environment/i.test(d.label)
          );

          const selectedDeviceId = backCamera?.id ?? devices[0].id;

          html5QrRef.current = new Html5Qrcode(qrcodeRegionId);
          await html5QrRef.current.start(
            selectedDeviceId,
            config,
            props.qrCodeSuccessCallback,
            props.qrCodeErrorCallback
          );

          setPermissionDenied(false);
        } else {
          console.error("No camera devices found.");
          setPermissionDenied(true);
        }
      } catch (err) {
        console.error("Error during scanner setup:", err);
        setPermissionDenied(true);
      }
    };

    startScanner();

    return () => {
      isMounted = false;

      if (html5QrRef.current) {
        html5QrRef.current
          .stop()
          .then(() => html5QrRef.current?.clear())
          .catch((err) =>
            console.error("Failed to stop and clear Html5Qrcode.", err)
          );
      }

      const region = document.getElementById(qrcodeRegionId);
      if (region) region.innerHTML = "";
    };
  }, [props.lang]);
  // Re-run when lang changes

  return (
    <>
      <div
        id={qrcodeRegionId}
        className={cn(
          "aspect-square w-screen max-w-[600px] [&>video]:w-full! [&>video]:h-full! [&>video]:object-cover!"
        )}
      >
        {permissionDenied && (
          <div className="w-full h-full flex flex-col items-center justify-center s text-center  border border-dashed dark:border-white border-black px-4">
            {props.lang === "en-US" && (
              <>
                <p className="font-semibold mb-2">Camera access is blocked.</p>
                <p className="text-sm mb-4">
                  To scan a QR code, you need to enable camera permissions in
                  your browser settings.
                </p>
                <p className="text-xs mb-2">
                  (Tip: Click the camera icon in your browser’s address bar to
                  allow access.)
                </p>
              </>
            )}

            {props.lang === "cz-CZ" && (
              <>
                <p className="font-semibold mb-2">
                  Přístup ke kameře byl zablokován.
                </p>
                <p className="text-sm mb-4">
                  Pro skenování QR kódu musíte povolit přístup ke kameře v
                  nastavení prohlížeče.
                </p>
                <p className="text-xs mb-2">
                  (Tip: Klikněte na ikonu kamery v adresním řádku prohlížeče a
                  povolte přístup.)
                </p>
              </>
            )}
          </div>
        )}
        {!permissionDenied && (
          <Skeleton className="w-full h-full rounded-none" />
        )}
      </div>
    </>
  );
};

export default Html5QrcodePlugin;
