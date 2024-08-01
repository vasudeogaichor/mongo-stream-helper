import { Command } from "commander";
import { downloadData, transferData } from "./tasks";
import { prompt } from "enquirer";
import path = require("path");
import {
  cliOption,
  cliQuestion,
  DownloadTaskOptions,
  TransferTaskOptions,
} from "./types";
import fs from "fs";
import { transferQuestions } from "./questions";

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
  .action(async (cmd) => {
    let options = cmd.config
      ? require(cmd.config)
      : await promptForDownloadOptions();
    // console.log("options - ", options);
    options = parseOptions(options);
    await downloadData(options);
  });

async function promptForDownloadOptions() {
  const questions = [
    {
      type: "input",
      name: "mongodbUri",
      message: "Enter MongoDB URI:",
      initial: "mongodb://localhost:27017",
      validate: (value: string) => {
        const uriPattern =
          /^mongodb(?:\+srv)?:\/\/(?:[^:]+:[^@]+@)?[^:\\/]+(?:\.[^:\\/]+)*(:\d+)?(?:\/[^?]*)?(?:\?.*)?$/;
        return uriPattern.test(value)
          ? true
          : "Please enter a valid MongoDB URI";
      },
    },
    {
      type: "input",
      name: "databaseName",
      message: "Enter database name:",
      validate: (value: string) =>
        value.trim().length > 0 || "Database name cannot be empty",
    },
    {
      type: "input",
      name: "sourceCollection",
      message: "Enter source collection name:",
      validate: (value: string) =>
        value.trim().length > 0 || "Collection name cannot be empty",
    },
    {
      type: "input",
      name: "filterQuery",
      message: "Enter filter query (JSON format):",
      initial: "{}",
      validate: (value: string) => {
        try {
          JSON.parse(value);
          return true;
        } catch (e) {
          return "Please enter a valid JSON format";
        }
      },
    },
    {
      type: "input",
      name: "skip",
      message: "Enter number of documents to skip:",
      initial: "0",
      validate: (value: string) => {
        const number = parseInt(value, 10);
        return (
          (!isNaN(number) && number >= 0) ||
          "Please enter a valid non-negative integer"
        );
      },
    },
    {
      type: "input",
      name: "limit",
      message: "Enter limit on number of documents to fetch:",
      initial: "0", // Use 0 to fetch all documents by default
      validate: (value: string) => {
        const number = parseInt(value, 10);
        return (
          (!isNaN(number) && number >= 0) ||
          "Please enter a valid non-negative integer"
        );
      },
    },
    {
      type: "input",
      name: "downloadLocation",
      message: "Enter download location:",
      initial: process.cwd(), // Default to current working directory
      validate: (value: string) => {
        try {
          // Validate if the path is valid and writable
          const resolvedPath = path.resolve(value);
          if (resolvedPath) {
            return true;
          }
          return false;
        } catch (e) {
          return "Please enter a valid file path";
        }
      },
    },
    {
      type: "input",
      name: "filename",
      message: "Enter filename:",
      initial: "download.json",
      validate: (value: string) =>
        value.trim().length > 0 || "Filename cannot be empty",
    },
    // Add more questions as needed
  ];

  return prompt(questions);
}

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
    // const options = cmd.config ? require(cmd.config) : await prompt(transferQuestions);
    // await transferData(options);
    
    let options: TransferTaskOptions = {
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
      options = JSON.parse(fs.readFileSync(cmd.config, "utf8"));
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
      options.sourceMongodbUri = cmd.sourceMongodbUri;
      options.sourceDatabaseName = cmd.sourceDatabaseName;
      options.sourceCollection = cmd.sourceCollection;
      options.filterQuery = cmd.filterQuery;
      options.skip = cmd.skip ? parseInt(cmd.skip, 10) : 0;
      options.limit = cmd.limit ? parseInt(cmd.limit, 10) : 0;
      options.targetMongodbUri = cmd.targetMongodbUri;
      options.targetDatabaseName = cmd.targetDatabaseName;
      options.targetCollection = cmd.targetCollection;
      options.updateExisting = cmd.updateExisting;
    }
    await transferData(options);
  });

program.parse(process.argv);
