import path from "path";

export const transferQuestions = [
  {
    type: "input",
    name: "sourceMongodbUri",
    message: "Enter Source MongoDB URI:",
    initial: "mongodb://localhost:27017",
    validate: (value: string) => {
      const uriPattern =
        /^mongodb(?:\+srv)?:\/\/(?:[^:]+:[^@]+@)?[^:\\/]+(?:\.[^:\\/]+)*(:\d+)?(?:\/[^?]*)?(?:\?.*)?$/;
      return uriPattern.test(value) ? true : "Please enter a valid MongoDB URI";
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
      return uriPattern.test(value) ? true : "Please enter a valid MongoDB URI";
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

export const downloadQuestions = [
  {
    type: "input",
    name: "mongodbUri",
    message: "Enter MongoDB URI:",
    initial: "mongodb://localhost:27017",
    validate: (value: string) => {
      const uriPattern =
        /^mongodb(?:\+srv)?:\/\/(?:[^:]+:[^@]+@)?[^:\\/]+(?:\.[^:\\/]+)*(:\d+)?(?:\/[^?]*)?(?:\?.*)?$/;
      return uriPattern.test(value) ? true : "Please enter a valid MongoDB URI";
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
];
