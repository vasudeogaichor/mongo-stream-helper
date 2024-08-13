import { Command } from "commander";
import { prompt } from "enquirer";

import { DownloadTaskOptions } from "../types";
import { downloadQuestions } from "../questions";
import { downloadData } from '../tasks/download';

// handle download task
export function createTransferCommand(program: Command) {
  program
    .command("download")
    .description("Download MongoDB data to local disk")
    .option("-c, --config <path>", "Path to JSON config file")
    .option("--mongodbUri <string>", "MongoDB URI")
    .option("--databaseName <string>", "Database name")
    .option("--sourceCollection <string>", "Source collection name")
    .option("--filterQuery <string>", "Filter query (JSON format)")
    .option("--skip <number>", "Number of documents to skip")
    .option("--limit <number>", "Limit on number of documents to fetch")
    .option("--downloadLocation <string>", "Download location (directory path)")
    .option("--filename <string>", "Filename for the downloaded data")
    .action(async (cmd) => {
      // console.log(cmd);
      const options = cmd.config
        ? require(`${process.cwd()}/${cmd.config}`)
        : {};

      let parsedOptions: DownloadTaskOptions = {
        ...options,
        mongodbUri: cmd.mongodbUri || options.mongodbUri,
        databaseName: cmd.databaseName || options.databaseName,
        sourceCollection: cmd.sourceCollection || options.sourceCollection,
        filterQuery: cmd.filterQuery
          ? JSON.parse(cmd.filterQuery)
          : options.filterQuery,
        skip: cmd.skip !== undefined ? parseInt(cmd.skip, 10) : options.skip,
        limit:
          cmd.limit !== undefined ? parseInt(cmd.limit, 10) : options.limit,
        downloadLocation: cmd.downloadLocation || options.downloadLocation,
        filename: cmd.filename || options.filename,
      };
      // console.log('options: ', options)
      // TODO: In future if an option is not found in cli params or config file, give a cli prompt for that option only
      if (
        !parsedOptions.mongodbUri ||
        !parsedOptions.databaseName ||
        !parsedOptions.sourceCollection ||
        !parsedOptions.downloadLocation ||
        !parsedOptions.filename
      ) {
        const responses = await prompt(downloadQuestions);
        parsedOptions = { ...parsedOptions, ...responses };
      }

      await downloadData(parsedOptions);
    });
}
