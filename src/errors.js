/**
 * Error types
 */
const ERRORS = Object.freeze({
    ARGS: {
        code: 1,
        description: "Insufficient arguments.",
    },
    INVALID_INPUT_FILE: {
        code: 2,
        description: "Invalid input file.",
    },
    INVALID_INPUT_FILE_FORMAT: {
        code: 3,
        description: "Invalid input file format.",
    },
    MISSING_INPUT_ID: {
        code: 4,
        description: "Failed file parsing.",
    },
    INVALID_INPUT_ID: {
        code: 5,
        description: "Failed file parsing.",
    },
    MISSING_INPUT_SLOTS: {
        code: 6,
        description: "Failed file parsing.",
    },
    INVALID_INPUT_SLOTS: {
        code: 7,
        description: "Failed file parsing.",
    },
    EMPTY_INPUT_SLOTS: {
        code: 8,
        description: "Failed file parsing.",
    },
    DUPLICATE_INPUT_ID: {
        code: 9,
        description: "Failed file parsing.",
    },
    INVALID_SLOT_IDENTIFIER: {
        code: 10,
        description: "Failed file parsing.",
    },
    INVALID_INTERVIEWERS_PER_SLOT: {
        code: 11,
        description: "Invalid specification of interviewers per slot. Should be a positive integer.",
    },
    INVALID_MAX_INTERVIEWS_PER_INTERVIEWER: {
        code: 12,
        description: "Invalid specification of max interviews per interviewer. Should be a positive integer.",
    },
    NO_ASSIGNMENT_AVAILABLE: {
        code: 13,
        description: "Failed to assign any of the candidates to an interview slot, with the given configuration.",
    },
    NETWORK: {
        code: 14,
        description: "Failed to access the remote resource.",
    },
    INVALID_DOODLE_DATA_FORMAT: {
        code: 15,
        description: "Doodle data format is invalid.",
    },
    UNMATCHING_DOODLES: {
        code: 16,
        description: "The two given doodles' slots do not match.",
    },
    INVALID_INPUT_TYPE: {
        code: 17,
        description: "Invalid input type.",
    },
});

module.exports = ERRORS;
