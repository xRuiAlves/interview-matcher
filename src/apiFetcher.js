const axios = require("axios");
const ERRORS = require("./errors");

const DOODLE_API_URL = (poll_id) => `https://doodle.com/api/v2.0/polls/${poll_id}?adminKey=&participantKey=`;

const fetchDoodleData = async (poll_id) => {
    try {
        const { data } = await axios.get(DOODLE_API_URL(poll_id));
        return data;
    } catch (_e) {
        throw { err: ERRORS.NETWORK };
    }
};

module.exports = {
    fetchDoodleData,
};
