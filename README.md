# Mongo Stream Helper

Mongo Stream Helper is a CLI tool designed to handle background tasks related to MongoDB data, such as downloading large collections using streaming and transferring data between collections. This tool can be used to manage MongoDB data more efficiently and can be packaged as an npm package for wider use.

## Features

- **Download large MongoDB data**: Stream and save data to the local disk.
- **Transfer MongoDB data**: Move data from one collection to another.
- **CLI and Config File Support**: Accept parameters through CLI inputs or a configuration file.
- **Progress Tracking**: Monitor the download process with progress indicators.

## Installation

First, clone the repository and navigate to the project directory:

```bash
git clone https://github.com/vasudeogaichor/mongo-stream-helper.git
cd mongo-stream-helper
```
Install the dependencies:
```bash
npm install
```

## Installation
### CLI Usage
You can run the CLI tool using npx and ts-node:
```bash
npx ts-node src/index.ts <command> [options]
```

### Commands

- **download**: Download data from a MongoDB collection to a local file.

### Options
- **`mongodbUri`** (string, required): MongoDB URI for connecting to the database.
- **`databaseName`**(string, required): Name of the database.
- **`sourceCollection`** (string, required): Name of the source collection.
- **`filterQuery`**(string, optional): Filter query in JSON format to apply to the collection.
- **`skip`**(number, optional): Number of documents to skip.
- **`limit`**(number, optional): Limit the number of documents to download.
- **`downloadLocation`**(string, required): Directory to save the downloaded file.
- **`filename`**(string, required): Name of the downloaded file.
- **`config`**(string, optional): Path to a JSON configuration file containing the above options.

### Example
1. Download data using CLI options:
```bash
npx ts-node src/index.ts download --mongodbUri "mongodb://root:example@localhost:27017" --databaseName "testdb" --sourceCollection "testcollection" --filterQuery "{}" --skip 0 --limit 1000 --downloadLocation "home/username/Downloads" --filename "data.json"
```

2. Download data using a configuration file:
Create a configuration file `downloadConfig.json`:

```bash
{
  "mongodbUri": "mongodb://root:example@localhost:27017",
  "databaseName": "testdb",
  "sourceCollection": "testcollection",
  "filterQuery": {},
  "skip": 0,
  "limit": 1000,
  "downloadLocation": "./downloads",
  "filename": "data.json"
}
```
Run the download command with the configuration file:
```bash
npx ts-node src/index.ts download --config downloadConfig.json
```

- **transfer**: Transfer data from one MongoDB collection to another collection.

### Options
- **`sourceMongodbUri`** (string, required): MongoDB URI for connecting to the database source.
- **`sourceDatabaseName`**(string, required): Name of the source database.
- **`sourceCollection`** (string, required): Name of the source collection.
- **`filterQuery`**(string, optional): Filter query in JSON format to apply to the source collection.
- **`skip`**(number, optional): Number of documents to skip.
- **`limit`**(number, optional): Limit the number of documents to download.
- **`targetMongodbUri`** (string, required): MongoDB URI for connecting to the database target.
- **`targetDatabaseName`**(string, required): Name of the target database.
- **`targetCollection`** (string, required): Name of the target collection.
- **`config`**(string, optional): Path to a JSON configuration file containing the above options.

### Example
1. Transfer data using CLI options:
```bash
npx ts-node src/index.ts transfer --sourceMongodbUri "mongodb://root:example@localhost:27017" --sourceDatabaseName "testdb" --sourceCollection "testcollection1" --filterQuery "{}" --skip 0 --limit 1000 --targetMongodbUri "mongodb://root:example@localhost:27017" --targetDatabaseName "testdb" --targetCollection "testcollection2"
```

2. Transfer data using a configuration file:
Create a configuration file `transferConfig.json`:

```bash
{
  "sourceMongodbUri": "mongodb://root:example@localhost:27017",
  "sourceDatabaseName": "testdb",
  "sourceCollection": "testcollection1",
  "filterQuery": {},
  "skip": 0,
  "limit": 10000,
  "targetMongodbUri": "mongodb://root:example@localhost:27017",
  "targetDatabaseName": "testdb",
  "targetCollection": "testcollection2",
  "updateExisting": true
}
```
Run the download command with the configuration file:
```bash
npx ts-node src/index.ts transfer --config transferConfig.json
```

## Development
### Building the Project
To build the project, run:
```bash
npm run build
```