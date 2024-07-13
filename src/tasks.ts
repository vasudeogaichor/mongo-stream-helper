import { MongoClient } from "mongodb";
import * as fs from "fs";
import ora from "ora";

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
interface DownloadTaskOptions {
  mongodbUri: string;
  databaseName: string;
  sourceCollection: string;
  filterQuery: object;
  skip: number;
  limit: number;
  downloadLocation: string;
  filename: string;
}

export async function downloadData(options: DownloadTaskOptions) {
  const spinner = ora("Connecting to MongoDB...").start();

  const client = new MongoClient(options.mongodbUri);
  try {
    await client.connect();
    const db = client.db(options.databaseName);
    const collection = db.collection(options.sourceCollection);

    const cursor = collection
      .find(options.filterQuery)
      .skip(options.skip)
      .limit(options.limit);

    const totalDocs = await collection.countDocuments(options.filterQuery, {
      skip: options.skip,
      limit: options.limit,
    });
    console.log('totalDocs - ', totalDocs);
    let processedDocs = 0;

    spinner.text = `Downloading data (${processedDocs}/${totalDocs})...`;

    const writeStream = fs.createWriteStream(
      `${options.downloadLocation}/${options.filename}`
    );

    cursor.stream().on("data", (doc) => {
      writeStream.write(JSON.stringify(doc) + "\n");
      processedDocs++;
      spinner.text = `Downloading data (${processedDocs}/${totalDocs})...`;
    });

    cursor.stream().on("end", () => {
      spinner.succeed("Download completed.");
      client.close();
    });

    cursor.stream().on("error", (err) => {
      spinner.fail("Download failed.");
      console.error(err);
      client.close();
    });
  } catch (err) {
    spinner.fail("Connection failed.");
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
