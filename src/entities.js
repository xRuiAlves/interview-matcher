/**
 * Hash entity, by joining their type with their id in a string literal
 * @param {String} type
 * @param {String} id
 * @returns {String} Hashed entity string
 */
const hashEntity = (type, id) => `${type}_${id}`;

/**
 * Reverse hash entity, returning their original id
 * @param {String} type
 * @param {String} hash
 * @returns {String} Entity id
 */
const dehashEntity = (type, hash) => {
    if (!hash.includes(type)) {
        throw new Error("Invalid hash type");
    }
    return hash.substr(type.length + 1);
};

module.exports = {
    hashEntity,
    dehashEntity,
};
