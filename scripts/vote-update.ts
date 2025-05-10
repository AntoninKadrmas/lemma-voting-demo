import { directusNoCashing } from "@/app/api/utils/directusConst";
import {
  deleteItem,
  deleteItems,
  updateItem,
  updateItems,
} from "@directus/sdk";
import yargs from "yargs";

async function main() {
  const argv = await yargs(process.argv.slice(2))
    .option("vote", {
      description: "Id of vote to be deleted else all votes are",
      type: "string",
    })
    .option("films", {
      description: "Id of films that should be updated in format [1,2,3]",
      type: "string",
      demandOption: true,
    })
    .check((argv) => {
      const filmsStr = argv.films;

      // Must match pattern like: [1], [1,2], [1,2,3] etc. with no spaces
      const regex = /^\[(\d+(,\d+)*)?\]$/;
      if (!regex.test(filmsStr)) {
        throw new Error(
          "films must be in format [1,2,3] with no spaces, only integers > 0, and mandatory brackets"
        );
      }

      // Extract numbers and validate each
      const numbers = filmsStr
        .slice(1, -1)
        .split(",")
        .map(Number)
        .filter((n) => !isNaN(n));
      if (!numbers.every((n) => Number.isInteger(n) && n > 0)) {
        throw new Error("Each film ID must be a valid integer greater than 0");
      }

      return true;
    })
    .help() // Automatically generates a --help option
    .alias("help", "h").argv; // Alias to trigger help with -h
  const vote = argv.vote;
  const films = argv.films;
  if (vote)
    directusNoCashing.request(
      updateItem("vote", vote, {
        films,
      })
    );
  else
    directusNoCashing.request(
      updateItems(
        "vote",
        {},
        {
          fields: {
            films,
          },
        }
      )
    );
}
main().catch((err) => console.error(err));
