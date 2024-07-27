export interface DownloadTaskOptions {
  mongodbUri: string;
  databaseName: string;
  sourceCollection: string;
  filterQuery: object;
  skip: number;
  limit: number;
  downloadLocation: string;
  filename: string;
}


export interface TransferTaskOptions {
  sourceMongodbUri: string;
  sourceDatabaseName: string;
  sourceCollection: string;
  filterQuery: object;
  skip: number;
  limit: number;
  targetMongodbUri: string;
  targetDatabaseName: string;
  targetCollection: string;
}