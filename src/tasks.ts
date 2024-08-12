import { MongoClient } from "mongodb";
import * as fs from "fs";
import ora from "ora";
import pm2 from "pm2";
import { DownloadTaskOptions, TransferTaskOptions } from "./types";

export async function downloadData(options: DownloadTaskOptions) {
  const spinner = ora("Connecting to MongoDB...").start();
  console.log("downloadData: ", options);

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
    spinner.start(`Downloading data (0/${totalDocs})...`);

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
      spinner.text = `Downloading data... (${Math.round(
        (processedDocs / totalDocs) * 100
      )}%)`;
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

export async function transferData(options: TransferTaskOptions) {
  // console.log("TransferTaskOptions: ", options)
  const spinner = ora("Connecting to MongoDB...").start();
  const sourceClient = new MongoClient(options.sourceMongodbUri);
  const targetClient = new MongoClient(options.targetMongodbUri);
  try {
    await sourceClient.connect();
    await targetClient.connect();

    await sourceClient.db(options.sourceDatabaseName).command({ ping: 1 });
    spinner.succeed("Connection established with source database.");

    await targetClient.db(options.targetDatabaseName).command({ ping: 1 });
    spinner.succeed("Connection established with target database.");

    const sourceDb = sourceClient.db(options.sourceDatabaseName);
    const sourceCollection = sourceDb.collection(options.sourceCollection);
    const targetDb = targetClient.db(options.targetDatabaseName);
    const targetCollection = targetDb.collection(options.targetCollection);

    const cursor = sourceCollection
      .find(options.filterQuery)
      .skip(options.skip)
      .limit(options.limit);
    const totalDocs = await sourceCollection.countDocuments(
      options.filterQuery,
      {
        skip: options.skip,
        ...(options.limit && { limit: options.limit }),
      }
    );

    let processedDocs = 0;
    spinner.text = `Transferring data (${processedDocs}/${totalDocs})...`;

    for await (const doc of cursor) {
      try {
        if (options.updateExisting) {
          await targetCollection.updateOne(
            { _id: doc._id },
            { $set: doc },
            { upsert: true } // This will insert the document if it doesn't exist, or update it if it does.
          );
        } else {
          await targetCollection.insertOne(doc);
        }
        processedDocs++;
        spinner.text = `Transferring data (${processedDocs}/${totalDocs})...`;
        spinner.render();
      } catch (err: any) {
        // TODO: Instead of filling the screen with warnings, keep a counter for documents skipped
        if (err.code === 11000 && !options.updateExisting) {
          // Duplicate key error, skip this document if not updating
          console.warn(
            `Duplicate key error for document with _id: ${doc._id}, skipping...`
          );
        } else {
          spinner.fail("Error transferring data.");
          console.error(err);
          break;
        }
      }
    }

    spinner.succeed("Transfer completed.");
  } catch (err) {
    spinner.fail("Error transferring data.");
    console.error(err);
    sourceClient.close();
    targetClient.close();
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}
