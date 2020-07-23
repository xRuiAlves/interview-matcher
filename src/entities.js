const hashEntity = (type, id) => `${type}_${id}`;

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
