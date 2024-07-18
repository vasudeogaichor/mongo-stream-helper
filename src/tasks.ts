import { MongoClient } from "mongodb";
import * as fs from "fs";
import ora from "ora";
import { DownloadTaskOptions } from "./types";

/*
interface TransferTaskOptions {
  mongodbUri: string;
  sourceCollection: string;
  filterQuery: object;
  // downloadLocation?: string;
  // filename?: string;
  targetCollection?: string;
}
*/

export async function downloadData(options: DownloadTaskOptions) {
  const spinner = ora("Connecting to MongoDB...").start();
  // console.log("downloadData: ", options);

  const client = new MongoClient(options.mongodbUri);
  try {
    await client.connect();

    await client.db(options.databaseName).command({ ping: 1 });
    spinner.succeed("Connection established.");

    const db = client.db(options.databaseName);
    const collection = db.collection(options.sourceCollection);

    const cursor = collection.find(options.filterQuery).skip(options.skip);
    // .limit(options.limit);

    if (options.limit !== 0) {
      cursor.limit(options.limit);
    }
    const stream = cursor.stream();

    const totalDocs = await collection.countDocuments(options.filterQuery, {
      skip: options.skip,
      ...(options.limit && { limit: options.limit }),
    });
    console.log("totalDocs - ", totalDocs);
    let processedDocs = 0;

    spinner.text = `Downloading data (${processedDocs}/${totalDocs})...`;

    const writeStream = fs.createWriteStream(
      `${options.downloadLocation}/${options.filename}`
    );
    writeStream.write("[");
    let isFirstDocument = true;

    stream.on("data", (doc) => {
      if (!isFirstDocument) {
        writeStream.write(",");
      }
      writeStream.write(JSON.stringify(doc));
      isFirstDocument = false;
      processedDocs++;
      spinner.text = `Downloading data (${processedDocs}/${totalDocs})...`;
    });

    stream.on("end", () => {
      writeStream.write("]");
      spinner.succeed("Download completed.");
      writeStream.end();
      client.close();
    });

    stream.on("error", (err) => {
      spinner.fail("Download failed.");
      console.error(err);
      client.close();
    });
  } catch (err) {
    spinner.fail("Error downloading data.");
    console.error(err);
    client.close();
  }
}

/*
export async function transferData(options: TaskOptions) {
  const spinner = ora('Connecting to MongoDB...').start();

  const client = new MongoClient(options.mongodbUri);
  await client.connect();

  const db = client.db();
  const sourceCollection = db.collection(options.sourceCollection);
  const targetCollection = db.collection(options.targetCollection);

  const cursor = sourceCollection.find(options.filterQuery);
  const totalDocs = await cursor.count();
  let processedDocs = 0;

  spinner.text = `Transferring data (${processedDocs}/${totalDocs})...`;

  cursor.stream().on('data', async (doc) => {
    await targetCollection.insertOne(doc);
    processedDocs++;
    spinner.text = `Transferring data (${processedDocs}/${totalDocs})...`;
  });

  cursor.stream().on('end', () => {
    spinner.succeed('Transfer completed.');
    client.close();
  });

  cursor.stream().on('error', (err) => {
    spinner.fail('Transfer failed.');
    console.error(err);
    client.close();
  });
}
*/
