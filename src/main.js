const { printUsage, printError } = require("./printer");
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

    const config = {
        interviewers_per_slot: 2,
        max_interviews_per_interviewer: 5,
    };

    return match(candidates, interviewers, config);
};

try {
    const res = main();
    console.log(res);
} catch (e) {
    printError(e.err, e.msg);
    process.exit(e.err.code);
}
