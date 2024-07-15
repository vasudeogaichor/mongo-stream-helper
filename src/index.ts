import { Command } from "commander";
import { downloadData /*, transferData*/ } from "./tasks";
import { prompt } from "enquirer";
import path = require("path");

const program = new Command();

program.version("0.1.0").description("CLI tool for MongoDB data tasks");

program
  .command("download")
  .description("Download MongoDB data to local disk")
  .option("-c, --config <path>", "Path to JSON config file")
  .action(async (cmd) => {
    const configPath: string = __dirname + "/" + cmd.config;
    const options = cmd.config ? require(configPath) : await promptForOptions();
    console.log("options - ", options);
    // TODO - figure out why is this needed to do again here
    options.filterQuery = JSON.parse(options.filterQuery);
    options.skip = parseInt(options.skip);
    options.limit = parseInt(options.limit);
    await downloadData(options);
  });

/*
program
  .command('transfer')
  .description('Transfer MongoDB data from one collection to another')
  .option('-c, --config <path>', 'Path to JSON config file')
  .action(async (cmd) => {
    const options = cmd.config ? require(cmd.config) : await promptForOptions();
    await transferData(options);
  });
*/
async function promptForOptions() {
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

program.parse(process.argv);
