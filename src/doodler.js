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

const doodlifyOutput = ({ matches, interviews_per_interviewer }) => {
    Object.keys(interviews_per_interviewer).forEach((interviewer) => {
        interviews_per_interviewer[convertToDoodleEntity(interviewer).name] = interviews_per_interviewer[interviewer];
        delete interviews_per_interviewer[interviewer];
    });

    return {
        matches: matches.map(({ slot, candidate, interviewers }) => {
            const [raw_start, raw_end] = slot.split("-");
            const start = convertDoodleDate(raw_start);
            const end = convertDoodleDate(raw_end);

            return {
                slot: { start, end },
                candidate: convertToDoodleEntity(candidate),
                interviewers: interviewers.map(convertToDoodleEntity),
            };
        }),
        interviews_per_interviewer,
    };
};

const convertToDoodleEntity = (entity) => {
    const separator_index = entity.lastIndexOf("_");
    if (separator_index === -1) {
        throw new Error("Missing entity separator");
    }
    return {
        name: entity.substr(0, separator_index),
        id: entity.substr(separator_index + 1),
    };
};

const convertDoodleDate = (doodle_date) => {
    const d = new Date(0);
    d.setUTCSeconds(doodle_date.substr(0, 10));
    return d.toUTCString();
};

module.exports = {
    convertDoodlesData,
    convertDoodleData,
    verifyDoodleSlotsMatching,
    doodlifyOutput,
    convertToDoodleEntity,
};
