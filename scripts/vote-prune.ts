import { directusNoCashing } from "@/app/api/utils/directusConst";
import { deleteItem, deleteItems } from "@directus/sdk";
import yargs from "yargs";

async function main() {
  const argv = await yargs(process.argv.slice(2))
    .option("vote", {
      description: "Id of vote to be deleted else all votes are",
      type: "string",
    })
    .help() // Automatically generates a --help option
    .alias("help", "h").argv; // Alias to trigger help with -h
  const vote = argv.vote;
  if (vote) directusNoCashing.request(deleteItem("vote", vote));
  else directusNoCashing.request(deleteItems("vote", {}));
}
main().catch((err) => console.error(err));
