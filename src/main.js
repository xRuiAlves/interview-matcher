const { printUsage, printError } = require("./printer");
const { readInputFile, validateFileData } = require("./fileReader");
const { match } = require("./matcher");
const ERRORS = require("./errors");

const main = () => {
    if (process.argv.length < 6) {
        printUsage();
        throw {
            err: ERRORS.ARGS,
        };
    }

    const candidates = readInputFile(process.argv[2]);
    const interviewers = readInputFile(process.argv[3]);
    const output_file = process.argv[4];
    const interviewers_per_slot = process.argv[5];
    const max_interviews_per_interviewer = process.argv[6] || 1e5;

    if (isNaN(interviewers_per_slot) || interviewers_per_slot <= 0) {
        throw {
            err: ERRORS.INVALID_INTERVIEWERS_PER_SLOT,
        };
    }

    if (isNaN(max_interviews_per_interviewer) || max_interviews_per_interviewer <= 0) {
        throw {
            err: ERRORS.INVALID_MAX_INTERVIEWS_PER_INTERVIEWER,
        };
    }

    validateFileData(candidates);
    validateFileData(interviewers);

    const config = {
        interviewers_per_slot: parseInt(interviewers_per_slot, 10),
        max_interviews_per_interviewer: parseInt(max_interviews_per_interviewer, 10),
    };

    console.log(output_file);

    return match(candidates, interviewers, config);
};

try {
    const res = main();
    console.log(res);
} catch (e) {
    printError(e.err, e.msg);
    process.exit(e.err.code);
}
