const printError = (err, msg) => {
    console.error(`Code: ${err.code}`);
    console.error(`Reason: ${err.description}`);
    if (msg) {
        console.error(`Message: ${msg}`);
    }
};

const printUsage = () => {
    console.log("usage: interview-matcher <candidates> <interviewers> [<configurations>]");
    console.log("\tcandidates: candidates options JSON file");
    console.log("\tinterviewers: interviewers options JSON file");
    console.log("\tconfigurations (OPTIONAL): tool configurations JSON file\n");
};

module.exports = {
    printError,
    printUsage,
};
