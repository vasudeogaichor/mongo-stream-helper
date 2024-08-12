import { Command } from "commander";
import { prompt } from "enquirer";

import { TransferTaskOptions } from "../types";
import { transferQuestions } from "../questions";
import { transferData } from "../tasks";

// handle transfer task
export function createDownloadCommand(program: Command) {
  program
    .command("transfer")
    .description("Transfer MongoDB data from one collection to another")
    .option("-c, --config <path>", "Path to JSON config file")
    .option("--sourceMongodbUri <string>", "Source MongoDB URI")
    .option("--sourceDatabaseName <string>", "Source database name")
    .option("--sourceCollection <string>", "Source collection name")
    .option("--filterQuery <string>", "Filter query (JSON format)")
    .option("--skip <number>", "Number of documents to skip")
    .option("--limit <number>", "Limit on number of documents to fetch")
    .option("--targetMongodbUri <string>", "Target MongoDB URI")
    .option("--targetDatabaseName <string>", "Target database name")
    .option("--targetCollection <string>", "Target collection name")
    .option("--updateExisting", "Update existing documents")
    .action(async (cmd) => {
      console.log("cmd: ", cmd);
      const options = cmd.config
        ? require(`${process.cwd()}/${cmd.config}`)
        : {};
      // console.log("options: ", options);
      let parsedOptions: TransferTaskOptions = {
        sourceMongodbUri: cmd.sourceMongodbUri || options.sourceMongodbUri,
        sourceDatabaseName:
          cmd.sourceDatabaseName || options.sourceDatabaseName,
        sourceCollection: cmd.sourceCollection || options.sourceCollection,
        filterQuery: cmd.filterQuery
          ? JSON.parse(cmd.filterQuery)
          : options.filterQuery,
        skip: cmd.skip ? parseInt(cmd.skip, 10) : options.skip,
        limit: cmd.limit ? parseInt(cmd.limit, 10) : options.limit,
        targetMongodbUri: cmd.targetMongodbUri || options.targetMongodbUri,
        targetDatabaseName:
          cmd.targetDatabaseName || options.targetDatabaseName,
        targetCollection: cmd.targetCollection || options.targetCollection,
        updateExisting: cmd.updateExisting ? true : options.updateExisting,
      };

      // TODO: In future if an option is not found in cli params or config file, give a cli prompt for that option only
      if (
        !parsedOptions.sourceMongodbUri ||
        !parsedOptions.sourceDatabaseName ||
        !parsedOptions.sourceCollection ||
        !parsedOptions.sourceMongodbUri ||
        !parsedOptions.targetMongodbUri ||
        !parsedOptions.targetDatabaseName ||
        !parsedOptions.targetCollection
      ) {
        const responses: Partial<TransferTaskOptions> = await prompt(
          transferQuestions
        );
        if (typeof responses?.skip === "string")
          responses.skip = parseInt(responses.skip, 10);
        if (typeof responses?.limit === "string")
          responses.limit = parseInt(responses.limit, 10);
        if (typeof responses?.filterQuery === "string")
          responses.filterQuery = JSON.parse(responses.filterQuery);
        // console.log('responses: ', responses)
        parsedOptions = { ...parsedOptions, ...responses };
      }

      await transferData(parsedOptions);
    });
}
