const printError = (err, msg) => {
    console.error(`Code: ${err.code}`);
    console.error(`Reason: ${err.description}`);
    if (msg) {
        console.error(`Message: ${msg}`);
    }
};

const printUsage = () => {
    console.info("usage: interview-matcher <input_type> <candidates> <interviewers> <output_file> <interviewers_per_slot>");
    console.info("\tinput_type: candidate and interviewer options input data type:");
    console.info("\t\t--json: JSON files");
    console.info("\t\t--doodle: doodle poll ids");
    console.info("\tcandidates: candidates options");
    console.info("\tinterviewers: interviewers options");
    console.info("\toutput_file: output file name");
    console.info("\tinterviewers_per_slot: required number of interviewers per slot");
};

module.exports = {
    printError,
    printUsage,
};
