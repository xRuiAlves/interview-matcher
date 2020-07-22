const hashEntity = (type, id) => `${type}_${id}`;

const dehashEntity = (type, hash) => hash.substr(type.length + 1);

module.exports = {
    hashEntity,
    dehashEntity,
};
