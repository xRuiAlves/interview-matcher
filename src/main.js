const { printUsage, printError } = require("./utils");
const { readInputFile, validateFileData } = require("./fileReader");
const { match } = require("./matcher");
const ERRORS = require("./errors");

const main = () => {
    if (process.argv.length < 4) {
        printUsage();
        throw {
            err: ERRORS.ARGS,
        };
    }

    const candidates = readInputFile(process.argv[2]);
    const interviewers = readInputFile(process.argv[3]);

    validateFileData(candidates);
    validateFileData(interviewers);

    return match(candidates, interviewers);
};

try {
    const res = main();
    console.log(res);
} catch (e) {
    printError(e.err, e.msg);
    process.exit(e.err.code);
}
