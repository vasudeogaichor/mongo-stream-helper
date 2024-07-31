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
  updateExisting: boolean
}

export interface cliQuestion {

  type: string;
  name: string;
  message: string;
  initial?: string;
  validate?: (value: string) => boolean | string;
}

export interface cliOption {
  description: string;
  default: string
}