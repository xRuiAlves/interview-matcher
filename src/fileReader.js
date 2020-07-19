const fs = require("fs");
const ERRORS = require("./errors");

const readInputFile = (file_name) => {
    let data;

    try {
        data = JSON.parse(fs.readFileSync(file_name));
    } catch (_e) {
        throw {
            err: ERRORS.INVALID_INPUT_FILE,
            msg: `The file ${file_name} is not a valid JSON file.`,
        };
    }

    validateFile(data, file_name);
    return data;
};

const validateFile = (data, file_name) => {
    if (!Array.isArray(data)) {
        throw {
            err: ERRORS.INVALID_INPUT_FILE_FORMAT,
            msg: `The file ${file_name} should be an options JSON Array.`,
        };
    }

    const names = new Set();

    data.forEach((option, index) => {
        if (!option.name) {
            throw {
                err: ERRORS.MISSING_INPUT_NAME,
                msg: `In file ${file_name}, subject num. ${index + 1} does not feature a required 'name' attribute.`,
            };
        }
        if (typeof option.name !== "string") {
            throw {
                err: ERRORS.INVALID_INPUT_NAME,
                msg: `In file ${file_name}, subject num. ${index + 1} 'name' is not a String.`,
            };
        }
        if (!option.slots) {
            throw {
                err: ERRORS.MISSING_INPUT_SLOTS,
                msg: `In file ${file_name}, subject num. ${index + 1} does not feature a required 'slots' attribute.`,
            };
        }
        if (!Array.isArray(option.slots)) {
            throw {
                err: ERRORS.INVALID_INPUT_SLOTS,
                msg: `In file ${file_name}, subject num. ${index + 1} 'slots' attribute should be an Array.`,
            };
        }
        if (option.slots.length === 0) {
            throw {
                err: ERRORS.EMPTY_INPUT_SLOTS,
                msg: `In file ${file_name}, subject num. ${index + 1} 'slots' Array is empty.`,
            };
        }
        if (names.has(option.name)) {
            throw {
                err: ERRORS.DUPLICATE_INPUT_NAME,
                msg: `In file ${file_name}, subject ${option.name} is declared twice.`,
            };
        }
        names.add(option.name);

        option.slots.forEach((slot, index) => {
            if (typeof slot !== "string") {
                throw {
                    err: ERRORS.INVALID_SLOT_IDENTIFIER,
                    msg: `In file ${file_name}, in subject num. ${index + 1}, slot num. ${index + 1} is not a String.`,
                };
            }
        });
    });
};

module.exports = {
    readInputFile,
};
