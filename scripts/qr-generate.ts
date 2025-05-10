import { readItems } from "@directus/sdk";
import { ApiCollections } from "../types/api-collection";
import QRCode from "qrcode";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import { directusNoCashing } from "@/app/api/utils/directusConst";
import yargs from "yargs";
import sharp from "sharp";
import dotenv from "dotenv";
dotenv.config();

const generatePDFWithQRCodes = async (
  data: ApiCollections["vote"][number][],
  fileName: string,
  logoSize: number,
  logoPath?: string
) => {
  const pdfDoc = await PDFDocument.create();
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let itemsOnPage = 0;
  const qrSize = 250; // Size in points (1/78 inch)
  const qrResolution = 300; // DPI
  const qrSizePixels = Math.round((qrSize / 78) * qrResolution);

  let optimizedLogoBuffer;
  if (logoPath) {
    // Calculate logo size (30% of QR code size)
    const logoSizePixels = Math.round(qrSizePixels * logoSize);
    optimizedLogoBuffer = await sharp(logoPath)
      .resize({
        width: logoSizePixels,
        height: logoSizePixels,
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
        kernel: sharp.kernel.lanczos3,
      })
      .png({
        quality: 100,
        compressionLevel: 0,
      })
      .toBuffer();
    console.log("Generated qr logo");
  }

  for (let i = 0; i < data.length; i++) {
    const val = data[i];
    if (!val.voting_id) continue;

    const url = `https://lemma-voting-demo.vercel.app/en/voting/${val.id}`;
    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "H",
      width: qrSizePixels,
      margin: 2, // Add some margin
      color: {
        dark: "#000000", // Pure black
        light: "#ffffff", // Pure white
      },
    });

    let qrImage;
    if (logoPath) {
      // Create QR code with logo
      const qrWithLogo = await sharp(
        Buffer.from(dataUrl.split(",")[1], "base64")
      )
        .ensureAlpha() // Ensure transparency channel exists
        .composite([
          {
            input: optimizedLogoBuffer,
            gravity: "center",
            blend: "over",
          },
        ])
        .resize(Math.round((qrSize / 72) * qrResolution)) // Downscale to target DPI
        .png({
          quality: 100,
          compressionLevel: 0,
        })
        .toBuffer();

      qrImage = await pdfDoc.embedPng(qrWithLogo);
    } else {
      qrImage = await pdfDoc.embedPng(dataUrl);
    }

    const quadrantX = (itemsOnPage % 2) * (pageWidth / 2);
    const quadrantY =
      pageHeight - Math.floor(itemsOnPage / 2 + 1) * (pageHeight / 2);
    const centerX = quadrantX + pageWidth / 4;
    const centerY = quadrantY + pageHeight / 4;

    // Draw Border Around Section
    page.drawRectangle({
      x: quadrantX,
      y: quadrantY,
      width: pageWidth / 2,
      height: pageHeight / 2,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    //  Draw QR
    page.drawImage(qrImage, {
      x: centerX - qrSize / 2,
      y: centerY - qrSize / 2,
      width: qrSize,
      height: qrSize,
    });

    // Draw Title
    let title = `Your unique voting link`;
    let titleSize = 20;
    let titleWidth = fontBold.widthOfTextAtSize(title, titleSize);
    page.drawText(title, {
      x: centerX - titleWidth / 2,
      y: centerY + qrSize / 2 + 20,
      size: titleSize,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    title = `Váš unikátní hlasovací link`;
    titleSize = 14;
    titleWidth = fontRegular.widthOfTextAtSize(title, titleSize);
    page.drawText(title, {
      x: centerX - titleWidth / 2,
      y: centerY + qrSize / 2,
      size: titleSize,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Draw Description
    let description = `https://lemma-voting-demo.vercel.app/en/voting/`;
    let descSize = 10;
    let descWidth = fontItalic.widthOfTextAtSize(description, descSize);
    page.drawText(description, {
      x: centerX - descWidth / 2,
      y: centerY - qrSize / 2,
      size: descSize,
      font: fontItalic,
      color: rgb(0, 0, 0),
    });

    description = val.id;
    descSize = 10;
    descWidth = fontItalic.widthOfTextAtSize(description, descSize);
    page.drawText(description, {
      x: centerX - descWidth / 2,
      y: centerY - qrSize / 2 - 10,
      size: descSize,
      font: fontItalic,
      color: rgb(0, 0, 0),
    });

    description = "Voting opens after 1st film";
    descSize = 15;
    descWidth = fontBold.widthOfTextAtSize(description, descSize);
    page.drawText(description, {
      x: centerX - descWidth / 2,
      y: centerY - qrSize / 2 - 30,
      size: descSize,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    description = "Hlasování se otevre po 1. filmu";
    descSize = 12;
    descWidth = fontRegular.widthOfTextAtSize(description, descSize);
    page.drawText(description, {
      x: centerX - descWidth / 2,
      y: centerY - qrSize / 2 - 45,
      size: descSize,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    // bottom left corner
    description = `Voting: FFFIMU25`;
    descSize = 10;
    descWidth = fontItalic.widthOfTextAtSize(description, descSize);
    page.drawText(description, {
      x: centerX - descWidth / 2,
      y: quadrantY + 5,
      size: descSize,
      font: fontItalic,
      color: rgb(0, 0, 0),
    });

    itemsOnPage++;
    if (itemsOnPage >= 4 && i < data.length - 1) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      itemsOnPage = 0;
    }
    console.log(`Generated qr code ${i + 1}/${data.length}`);
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(`${fileName}.pdf`, pdfBytes);
};

async function main() {
  const argv = await yargs(process.argv.slice(2))
    .option("amount", {
      description: "Amount of QR codes to generate.",
      type: "number",
      demandOption: true, // This makes --amount required
    })
    .option("name", {
      description: "Name for the generated QR codes PDF.",
      type: "string",
      default: "LemmaVotingQr", // Default value if not provided
    })
    .option("logo", {
      description:
        "Relative path to the logo that should be placed in the middle.",
      type: "string",
    })
    .option("logosize", {
      description:
        "Multiplier between 0 and 1 where 1 is size of qrcode and 0 is hidden.",
      type: "number",
      default: 0.3,
    })
    .check((argv) => {
      if (!Number.isInteger(argv.amount) || argv.amount < 0) {
        throw new Error("amount must be an integer 0 or greater");
      }
      return true;
    })
    .check((argv) => {
      if (argv.logosize < 0 || argv.logosize > 1) {
        throw new Error("logosize must be between 0 and 1 (inclusive)");
      }
      return true; // validation passed
    })
    .help() // Automatically generates a --help option
    .alias("help", "h").argv; // Alias to trigger help with -h

  const amount = argv.amount;
  const name = argv.name;
  const logo = argv.logo;
  const logoSize = argv.logosize;

  const data = await directusNoCashing.request<
    ApiCollections["vote"][number][]
  >(readItems("vote", { limit: amount }));
  generatePDFWithQRCodes(data, name, logoSize, logo);
}
main().catch((err) => console.error(err));
