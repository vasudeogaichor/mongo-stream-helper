import { Command } from "commander";
import { downloadData, transferData } from "./tasks";
import { prompt } from "enquirer";

import path = require("path");
import { DownloadTaskOptions, TransferTaskOptions } from "./types";
import fs from "fs";
import { downloadQuestions, transferQuestions } from "./questions";

const program = new Command();

const parseOptions = function (options: DownloadTaskOptions) {
  options.filterQuery =
    typeof options.filterQuery === "string"
      ? JSON.parse(options.filterQuery)
      : options.filterQuery;
  options.skip = parseInt(options.skip.toString()) || 0;
  options.limit = parseInt(options.limit.toString()) || 0;
  return options;
};

program.version("0.1.0").description("CLI tool for MongoDB data tasks");

// ts-node src/index.ts transfer --config /home/lord_saum/vasudeo/mongo-stream-helper/src/transferConfig.json

// handle download task
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
    const options = cmd.config ? require(`${process.cwd()}/${cmd.config}`) : {};

    let parsedOptions: DownloadTaskOptions = {
      ...options,
      mongodbUri: cmd.mongodbUri || options.mongodbUri,
      databaseName: cmd.databaseName || options.databaseName,
      sourceCollection: cmd.sourceCollection || options.sourceCollection,
      filterQuery: cmd.filterQuery
        ? JSON.parse(cmd.filterQuery)
        : options.filterQuery,
      skip: cmd.skip !== undefined ? parseInt(cmd.skip, 10) : options.skip,
      limit: cmd.limit !== undefined ? parseInt(cmd.limit, 10) : options.limit,
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

// handle transfer task
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
    // console.log("cmd: ", cmd);
    const options = cmd.config ? require(`${process.cwd()}/${cmd.config}`) : {};

    let parsedOptions: TransferTaskOptions = {
      sourceMongodbUri: cmd.sourceMongodbUri || options.sourceMongodbUri,
      sourceDatabaseName: cmd.sourceDatabaseName || options.sourceDatabaseName,
      sourceCollection: cmd.sourceCollection || options.sourceCollection,
      filterQuery: cmd.filterQuery
        ? JSON.parse(cmd.filterQuery)
        : options.filterQuery,
      skip: cmd.skip ? parseInt(cmd.skip, 10) : options.skip,
      limit: cmd.limit ? parseInt(cmd.limit, 10) : options.limit,
      targetMongodbUri: cmd.targetMongodbUri || options.targetMongodbUri,
      targetDatabaseName: cmd.targetDatabaseName || options.targetDatabaseName,
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
      const responses: Partial<TransferTaskOptions> = await prompt(transferQuestions);
      if (typeof responses?.skip === 'string') responses.skip = parseInt(responses.skip, 10);
      if (typeof responses?.limit === 'string') responses.limit = parseInt(responses.limit, 10);
      if (typeof responses?.filterQuery === 'string') responses.filterQuery = JSON.parse(responses.filterQuery);
      // console.log('responses: ', responses)
      parsedOptions = { ...parsedOptions, ...responses };
    }

    await transferData(parsedOptions);
  });

program.parse(process.argv);
