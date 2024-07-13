import { MongoClient } from 'mongodb';
import { faker } from '@faker-js/faker';

async function generateData() {
  const uri = 'mongodb://root:example@localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const database = client.db('testdb');
    const collection = database.collection('testcollection1');

    // Number of documents to generate
    const numberOfDocuments = 100000;

    // Array to hold documents
    const documents = [];
    const startTime = Date.now();
    for (let i = 0; i < numberOfDocuments; i++) {
      console.log(i);
      documents.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        country: faker.location.country(),
        company: faker.company.name(),
        phone: faker.phone.number(),
        dateOfBirth: faker.date.birthdate(),
        largeObject: {
          field1: faker.lorem.paragraphs(10),
          field2: faker.lorem.paragraphs(10),
          field3: faker.lorem.paragraphs(10),
          field4: faker.lorem.paragraphs(10),
          field5: faker.lorem.paragraphs(10),
          field6: faker.lorem.paragraphs(10),
          field7: faker.lorem.paragraphs(10),
          field8: faker.lorem.paragraphs(10),
          field9: faker.lorem.paragraphs(10),
          field10: faker.lorem.paragraphs(10),
        },
      });

      // Insert in batches to avoid memory issues
      if (documents.length === 1000) {
        await collection.insertMany(documents);
        documents.length = 0; // Clear the array
      }
    }
    const endTime = Date.now();
    console.log('Total time: ', endTime - startTime);

    // Insert remaining documents if any
    if (documents.length > 0) {
      await collection.insertMany(documents);
    }

    console.log(`Inserted ${numberOfDocuments} documents into the collection`);
  } catch (error) {
    console.error('Error generating data:', error);
  } finally {
    await client.close();
  }
}

generateData();
