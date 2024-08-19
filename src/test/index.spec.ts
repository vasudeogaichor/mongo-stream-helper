import { expect } from "chai";
import fs from "fs";
import path from "path";
import { downloadData } from "../tasks/download";
import { transferData } from "../tasks/transfer";
import { MongoClient } from "mongodb";

describe("Mongo Stream Helper Tests", function () {
  this.timeout(60000); // Extend timeout for longer operations

  it("should download data from MongoDB to a JSON file", async function () {
    const options = {
      mongodbUri: "mongodb://root:example@localhost:27017",
      databaseName: "testdb",
      sourceCollection: "testcollection1",
      filterQuery: {},
      skip: 0,
      limit: 10,
      downloadLocation: "/home/lord_saum/vasudeo/mongo-stream-helper/src/test",
      filename: "test_download.json",
    };

    await downloadData(options);

    const filePath = path.join(
      options.downloadLocation,
      options.filename
    );
    // console.log('filePath: ', filePath)
    expect(fs.existsSync(filePath)).to.be.true;
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const downloadedDocs = JSON.parse(fileContent);
    expect(downloadedDocs).to.have.lengthOf(10);
  });

  it("should transfer data from one MongoDB collection to another", async function () {
    const options = {
      sourceMongodbUri: "mongodb://root:example@localhost:27017",
      targetMongodbUri: "mongodb://root:example@localhost:27017",
      sourceDatabaseName: "testdb",
      targetDatabaseName: "testdb",
      sourceCollection: "testcollection1",
      targetCollection: "testcollection2",
      filterQuery: {},
      skip: 0,
      limit: 10,
      updateExisting: false, // Or true, based on what you want to test
    };

    await transferData(options);

    const targetClient = new MongoClient(options.targetMongodbUri);
    await targetClient.connect();
    const targetCollection = targetClient
      .db(options.targetDatabaseName)
      .collection(options.targetCollection);
    const transferredDocsCount = await targetCollection.countDocuments();
    expect(transferredDocsCount).to.equal(10);
    await targetClient.close();
  });
});
