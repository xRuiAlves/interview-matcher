const ERRORS = require("./errors");

const convertDoodlesData = (candidates_doodle, interviewers_doodle) => {
    if (!verifyDoodleSlotsMatching(candidates_doodle, interviewers_doodle)) {
        throw { err: ERRORS.UNMATCHING_DOODLES };
    }

    return {
        candidates: convertDoodleData(candidates_doodle).participants,
        interviewers: convertDoodleData(interviewers_doodle).participants,
    };
};

const convertDoodleData = (doodle_data) => {
    if (!doodle_data.options) {
        throw {
            err: ERRORS.INVALID_DOODLE_DATA_FORMAT,
            msg: "Doodle data 'options' field is missing.",
        };
    } else if (!Array.isArray(doodle_data.options)) {
        throw {
            err: ERRORS.INVALID_DOODLE_DATA_FORMAT,
            msg: "Doodle data 'options' field should be of type Array.",
        };
    } else if (!doodle_data.participants) {
        throw {
            err: ERRORS.INVALID_DOODLE_DATA_FORMAT,
            msg: "Doodle data 'participants' field is missing.",
        };
    } else if (!Array.isArray(doodle_data.participants)) {
        throw {
            err: ERRORS.INVALID_DOODLE_DATA_FORMAT,
            msg: "Doodle data 'participants' field should be of type Array.",
        };
    }

    const slots = doodle_data.options.map(({ start, end }) => `${start}-${end}`);
    const participants = doodle_data.participants.map((participant) => {
        const entry = {
            id: `${participant.name}_${participant.id}`,
            slots: [],
        };

        participant.preferences.forEach((is_option_picked, index) => {
            if (is_option_picked) {
                entry.slots.push(slots[index]);
            }
        });

        return entry;
    });

    return {
        slots,
        participants,
    };
};

const verifyDoodleSlotsMatching = (doodle_data_1, doodle_data_2) => doodle_data_1.options.toString() === doodle_data_2.options.toString();

module.exports = {
    convertDoodlesData,
    convertDoodleData,
    verifyDoodleSlotsMatching,
};
