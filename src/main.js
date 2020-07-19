const { printUsage, printError } = require("./utils");
const { readInputFile } = require("./fileReader");
const ERRORS = require("./errors");

if (process.argv.length < 4) {
    printUsage();
    printError(ERRORS.ARGS);
}

const candidates = readInputFile(process.argv[2]);
const interviewers = readInputFile(process.argv[3]);
