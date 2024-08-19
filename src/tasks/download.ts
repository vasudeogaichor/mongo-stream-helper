import { MongoClient } from "mongodb";
import * as fs from "fs";
import ora from "ora";
import { DownloadTaskOptions } from "../types";
import { sendTaskCompletionNotification } from '../notifier';

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
      sendTaskCompletionNotification({
        taskName: `Download to local`,
        status: 'completed',
        message: 'All documents have been downloaded successfully.'
      });
    });

    stream.on("error", (err) => {
      spinner.fail("Download failed.");
      console.error(err);
      client.close();
      sendTaskCompletionNotification({
        taskName: `Download to local`,
        status: 'failed',
        message: 'There was an error while downloading the documents.'
      });
    });
  } catch (err) {
    spinner.fail("Error downloading data.");
    console.error(err);
    client.close();
    sendTaskCompletionNotification({
      taskName: `Download to local`,
      status: 'failed',
      message: 'There was an error while downloading the documents.'
    });
  }
}
