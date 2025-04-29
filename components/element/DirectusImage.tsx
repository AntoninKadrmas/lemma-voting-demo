/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import ExportedImage, {
  type ExportedImageProps,
} from "next-image-export-optimizer";
import { type components } from "@/types/api-collection";
import { getAssetUrl, parseUrl, TransformationPresets } from "@/lib/utils";
import { getFileDataMetadata } from "@/lib/publicDirectus";

export type AssetMetadata = {
  src: string;
} & ExportedImageProps &
  Omit<components["schemas"]["Files"], "any">;

interface DirectusImageProps extends Omit<ExportedImageProps, "src"> {
  className?: string;
  id?: string;
  src?: string;
  metadata?: AssetMetadata;
  transformkey?: TransformationPresets;
}

export default async function DirectusImage({
  id,
  metadata = {} as AssetMetadata,
  transformkey = "1200w",
  ...props
}: DirectusImageProps) {
  if (metadata) {
    props = {
      ...props,

      alt: props.alt ?? metadata.title ?? "",
      src: getAssetUrl(metadata.filename_disk),
      width: props.width ?? metadata.width,
      height: props.height ?? metadata.height,
    };
  }
  if (id && id != "null") {
    try {
      metadata = (await getFileDataMetadata(id)) as AssetMetadata;
      props = {
        ...props,

        alt: props.alt ?? metadata.title ?? "",
        src: metadata.filename_disk
          ? getAssetUrl(metadata.filename_disk)
          : getAssetUrl(id),
        width: props.width ?? metadata.width,
        height: props.height ?? metadata.height,
      };
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <ExportedImage
      overrideSrc={parseUrl(props.src, transformkey)}
      style={
        metadata.focal_point_y
          ? { marginBottom: metadata.focal_point_y }
          : undefined
      }
      {...(props as ExportedImageProps)}
      alt={props.alt}
    />
  );
}
