#!/usr/bin/env node
import { Command } from "commander";
import { createTransferCommand } from "./commands/transfer";
import { createDownloadCommand } from "./commands/download";

const program = new Command();

program.version("0.1.0").description("CLI tool for MongoDB data tasks");

// ts-node src/index.ts transfer --config /home/mongo-stream-helper/src/transferConfig.json

createDownloadCommand(program);
createTransferCommand(program);

program.parse(process.argv);
