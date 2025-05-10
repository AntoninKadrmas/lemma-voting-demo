import dotenv from "dotenv";
dotenv.config();
import { directusNoCashing } from "@/app/api/utils/directusConst";
import { createItem } from "@directus/sdk";
import yargs from "yargs";

async function main() {
  const argv = await yargs(process.argv.slice(2))
    .option("amount", {
      description: "Amount of QR codes to generate.",
      type: "number",
      demandOption: true, // This makes --amount required
    })
    .option("voting", {
      description: "Id of voting to which the votes belongs to",
      type: "string",
      default: "a2f8a4e8-9f73-4c56-b353-2fc3bfe0d91b",
    })
    .check((argv) => {
      if (!Number.isInteger(argv.amount) || argv.amount < 0) {
        throw new Error("amount must be an integer 0 or greater");
      }
      return true;
    })
    .help() // Automatically generates a --help option
    .alias("help", "h").argv; // Alias to trigger help with -h

  const amount = argv.amount;
  const votingId = argv.voting;

  for (let i = 0; i < amount; i++) {
    directusNoCashing.request(
      createItem("vote", {
        voting_id: votingId,
      })
    );
  }
}
main().catch((err) => console.error(err));
