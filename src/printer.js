const printError = (err, msg) => {
    console.error(`Code: ${err.code}`);
    console.error(`Reason: ${err.description}`);
    if (msg) {
        console.error(`Message: ${msg}`);
    }
};

const printUsage = () => {
    console.log("usage: interview-matcher <candidates> <interviewers> <output_file> <interviewers_per_slot> [<max_interviews_per_interviewer>]");
    console.log("\tcandidates: candidates options JSON file");
    console.log("\tinterviewers: interviewers options JSON file");
    console.log("\toutput_file: out file name");
    console.log("\tinterviewers_per_slot: required number of interviewers per slot");
    console.log("\tmax_interviews_per_interviewer (OPTIONAL): maximum number of interviews that a interviewer may be assigned to");
};

module.exports = {
    printError,
    printUsage,
};
