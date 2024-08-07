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

    // if (cmd.config) {
    //   parsedOptions = JSON.parse(fs.readFileSync(cmd.config, "utf8"));
    // } else {
    //   // Convert filterQuery string to object if provided
    //   if (options.filterQuery) {
    //     try {
    //       options.filterQuery = JSON.parse(options.filterQuery);
    //     } catch (error) {
    //       console.error("Invalid JSON format for filterQuery");
    //       process.exit(1);
    //     }
    //   }

    //   // Assign CLI options to the options object
    //   parsedOptions.mongodbUri = options.mongodbUri;
    //   parsedOptions.databaseName = options.databaseName;
    //   parsedOptions.sourceCollection = options.sourceCollection;
    //   parsedOptions.filterQuery = options.filterQuery;
    //   parsedOptions.skip = options.skip ? parseInt(options.skip, 10) : 0;
    //   parsedOptions.limit = options.limit ? parseInt(options.limit, 10) : 0;
    //   parsedOptions.downloadLocation = options.downloadLocation;
    //   parsedOptions.filename = options.filename;
    // }
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
    // console.log("cmd.config: ", cmd.config);
    const options = cmd.config
      ? require(cmd.config)
      : await prompt(transferQuestions);
    // await transferData(options);

    let parseOptions: TransferTaskOptions = {
      sourceMongodbUri: "",
      sourceDatabaseName: "",
      sourceCollection: "",
      filterQuery: {},
      skip: 0,
      limit: 0,
      targetMongodbUri: "",
      targetDatabaseName: "",
      targetCollection: "",
      updateExisting: false,
    };

    if (cmd.config) {
      parseOptions = JSON.parse(fs.readFileSync(cmd.config, "utf8"));
    } else {
      // Convert filterQuery string to object if provided
      if (cmd.filterQuery) {
        try {
          cmd.filterQuery = JSON.parse(cmd.filterQuery);
        } catch (error) {
          console.error("Invalid JSON format for filterQuery");
          process.exit(1);
        }
      }

      // Assign CLI options to the options object
      parseOptions.sourceMongodbUri = cmd.sourceMongodbUri;
      parseOptions.sourceDatabaseName = cmd.sourceDatabaseName;
      parseOptions.sourceCollection = cmd.sourceCollection;
      parseOptions.filterQuery = cmd.filterQuery;
      parseOptions.skip = cmd.skip ? parseInt(cmd.skip, 10) : 0;
      parseOptions.limit = cmd.limit ? parseInt(cmd.limit, 10) : 0;
      parseOptions.targetMongodbUri = cmd.targetMongodbUri;
      parseOptions.targetDatabaseName = cmd.targetDatabaseName;
      parseOptions.targetCollection = cmd.targetCollection;
      parseOptions.updateExisting = cmd.updateExisting;
    }
    await transferData(parseOptions);
  });

program.parse(process.argv);
