const { printUsage } = require("./printer");
const { readInputFile, validateFileData, writeJSONtoFile } = require("./fileUtils");
const { match } = require("./matcher");
const { fetchDoodleData } = require("./apiFetcher");
const { convertDoodlesData, doodlifyOutput } = require("./doodler");
const ERRORS = require("./errors");
const INPUT_TYPE_FLAGS = require("./inputTypeFlags");

const main = async () => {
    if (process.argv.length < 6) {
        printUsage();
        throw { err: ERRORS.ARGS };
    }

    const input_type = process.argv[2];
    if (!Object.values(INPUT_TYPE_FLAGS).includes(input_type)) {
        printUsage();
        throw {
            err: ERRORS.INVALID_INPUT_TYPE,
        };
    }

    const candidates_input = process.argv[3];
    const interviewers_input = process.argv[4];
    const output_file = process.argv[5];
    const interviewers_per_slot = process.argv[6] || 1;
    const max_interviews_per_interviewer = 1e5;

    if (isNaN(interviewers_per_slot) || interviewers_per_slot <= 0) {
        throw { err: ERRORS.INVALID_INTERVIEWERS_PER_SLOT };
    }

    let candidates, interviewers;

    if (input_type === INPUT_TYPE_FLAGS.JSON) {
        console.info("Reading candidates JSON file ...");
        candidates = readInputFile(candidates_input);
        console.info("Done.");
        console.info("Reading interviewers JSON file ...");
        interviewers = readInputFile(interviewers_input);
        console.info("Done.");

        validateFileData(candidates);
        validateFileData(interviewers);
    } else if (input_type === INPUT_TYPE_FLAGS.DOODLE) {
        console.info("Fetching data from candidates doodle poll ...");
        const candidates_doodle = await fetchDoodleData(candidates_input);
        console.info("Done.");
        console.info("Fetching data from interviewers doodle poll ...");
        const interviewers_doodle = await fetchDoodleData(interviewers_input);
        console.info("Done.");

        const converted_data = convertDoodlesData(candidates_doodle, interviewers_doodle);
        candidates = converted_data.candidates;
        interviewers = converted_data.interviewers;
    }

    const config = {
        interviewers_per_slot: parseInt(interviewers_per_slot, 10),
        max_interviews_per_interviewer: parseInt(max_interviews_per_interviewer, 10),
    };

    const output = match(candidates, interviewers, config);

    if (output.matches.length === 0) {
        throw { err: ERRORS.NO_ASSIGNMENT_AVAILABLE };
    }

    if (output.matches.length < candidates.length) {
        console.info("Failed to assign all candidates to interview slots. All the possible assignments have been exported.");
    }

    writeJSONtoFile(
        input_type === INPUT_TYPE_FLAGS.DOODLE ? doodlifyOutput(output) : output,
        output_file,
    );
};

module.exports = {
    main,
};
