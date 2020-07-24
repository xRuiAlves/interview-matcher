const axios = require("axios");
const ERRORS = require("./errors");

/**
 * Substitute poll id in doodle poll api url
 * @param {String} poll_id
 * @returns {String} Doodle poll url
 */
const DOODLE_API_URL = (poll_id) => `https://doodle.com/api/v2.0/polls/${poll_id}?adminKey=&participantKey=`;

/**
 * Fetch doodle poll data form doodle api
 * @param {String} poll_id
 * @throws {Object}
 * @returns {Object} Doodle poll data
 */
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
