const fs = require("fs");
const { printError } = require("./utils");
const ERRORS = require("./errors");

const readInputFile = (file_name) => {
    try {
        const data = JSON.parse(fs.readFileSync(file_name));
        validateFile(data, file_name);
        return data;
    } catch (_e) {
        printError(ERRORS.INVALID_INPUT_FILE, `The file ${file_name} is not a valid JSON file.`);
    }
};

const validateFile = (data, file_name) => {
    if (!Array.isArray(data)) {
        printError(ERRORS.INVALID_INPUT_FILE, `The file ${file_name} should be an options JSON Array.`);
    }

    const names = new Set();

    data.forEach((option, index) => {
        if (!option.name) {
            printError(ERRORS.INVALID_INPUT_FILE, `In file ${file_name}, subject num. ${index + 1} does not feature a required 'name' attribute.`);
        }
        if (typeof option.name !== "string") {
            printError(ERRORS.INVALID_INPUT_FILE, `In file ${file_name}, subject num. ${index + 1} 'name' is not a String.`);
        }
        if (!option.slots) {
            printError(ERRORS.INVALID_INPUT_FILE, `In file ${file_name}, subject num. ${index + 1} does not feature a required 'slots' attribute.`);
        }
        if (!Array.isArray(option.slots)) {
            printError(ERRORS.INVALID_INPUT_FILE, `In file ${file_name}, subject num. ${index + 1} 'slots' attribute should be an Array.`);
        }
        if (option.slots.length === 0) {
            printError(ERRORS.INVALID_INPUT_FILE, `In file ${file_name}, subject num. ${index + 1} 'slots' Array is empty.`);
        }
        if (names.has(option.name)) {
            printError(ERRORS.INVALID_INPUT_FILE, `In file ${file_name}, subject ${option.name} is declared twice.`);
        }
        names.add(option.name);

        option.slots.forEach((slot, index) => {
            if (typeof slot !== "string") {
                printError(ERRORS.INVALID_INPUT_FILE, `In file ${file_name}, in subject num. ${index + 1}, slot num. ${index + 1} is not a String.`);
            }
        });
    });
};

module.exports = {
    readInputFile,
};
