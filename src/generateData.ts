const { MongoClient } = require('mongodb');
const { faker } = require('@faker-js/faker');

async function generateData() {
  const uri = 'mongodb://root:example@localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const database = client.db('testdb');
    const collection = database.collection('testcollection1');

    const numberOfDocuments = 100; // Small dataset for testing
    const documents = [];

    for (let i = 0; i < numberOfDocuments; i++) {
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
          field1: faker.lorem.paragraphs(2),
          field2: faker.lorem.paragraphs(2),
        },
      });

      if (documents.length === 20) { // Insert in batches of 20
        await collection.insertMany(documents);
        documents.length = 0;
      }
    }

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
