import { Command } from "commander";
import { downloadData, transferData } from "./tasks";
import { prompt } from "enquirer";
import path = require("path");
import { DownloadTaskOptions } from './types';

const program = new Command();

const parseOptions = function (options: DownloadTaskOptions) {
  options.filterQuery = typeof options.filterQuery === 'string' ? JSON.parse(options.filterQuery) : options.filterQuery;
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
    let options = cmd.config ? require(cmd.config) : await promptForDownloadOptions();
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
  .command('transfer')
  .description('Transfer MongoDB data from one collection to another')
  .option('-c, --config <path>', 'Path to JSON config file')
  .action(async (cmd) => {
    const options = cmd.config ? require(cmd.config) : await promptForTransferOptions();
    await transferData(options);
  });


async function promptForTransferOptions() {
  const questions = [
    {
      type: "input",
      name: "sourceMongodbUri",
      message: "Enter Source MongoDB URI:",
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
      name: "sourceDatabaseName",
      message: "Enter source database name:",
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
      name: "targetMongodbUri",
      message: "Enter Target MongoDB URI:",
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
      name: "targetDatabaseName",
      message: "Enter target database name:",
      validate: (value: string) =>
        value.trim().length > 0 || "Database name cannot be empty",
    },
    {
      type: "input",
      name: "targetCollection",
      message: "Enter target collection name:",
      validate: (value: string) =>
        value.trim().length > 0 || "Collection name cannot be empty",
    },
    {
      type: "confirm",
      name: "updateExisting",
      message: "Do you want to update existing documents?:",
      default: false,
    },
    // Add more questions as needed
  ];

  return prompt(questions);
}

program.parse(process.argv);
