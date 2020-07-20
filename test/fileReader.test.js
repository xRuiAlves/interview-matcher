/* eslint-disable no-undef */
const { readInputFile, validateFileData } = require("../src/fileReader");

describe("Correct file reading and validating", () => {
    it("should read a well-formed valid file", () => {
        const data = readInputFile(`${__dirname}/fixtures/valid_candidates.json`);
        expect(Array.isArray(data)).toBe(true);
    });

    it("should validate a valid file", () => {
        const data = readInputFile(`${__dirname}/fixtures/valid_candidates.json`);
        expect(validateFileData(data)).toBe(true);
    });
});

describe("Detect invalid file format and/or structure", () => {
    it("should fail if input file is not JSON", () => {
        try {
            readInputFile(`${__dirname}/fixtures/not_json.txt`);
            fail("Should have thrown exception");
        } catch ({ err }) {
            expect(err.code).toBe(2);
        }
    });

    it("should fail if input file is not Array", () => {
        try {
            const data = readInputFile(`${__dirname}/fixtures/invalid_json_format.json`);
            validateFileData(data);
            fail("Should have thrown exception");
        } catch ({ err }) {
            expect(err.code).toBe(3);
        }
    });

    it("should fail if any subject's id is missing", () => {
        try {
            const data = readInputFile(`${__dirname}/fixtures/missing_id.json`);
            validateFileData(data);
            fail("Should have thrown exception");
        } catch ({ err }) {
            expect(err.code).toBe(4);
        }
    });

    it("should fail if any subject's id is not a String", () => {
        try {
            const data = readInputFile(`${__dirname}/fixtures/invalid_id.json`);
            validateFileData(data);
            fail("Should have thrown exception");
        } catch ({ err }) {
            expect(err.code).toBe(5);
        }
    });

    it("should fail if any subject's slots are missing", () => {
        try {
            const data = readInputFile(`${__dirname}/fixtures/missing_slots.json`);
            validateFileData(data);
            fail("Should have thrown exception");
        } catch ({ err }) {
            expect(err.code).toBe(6);
        }
    });

    it("should fail if any subject's slots are not an Array", () => {
        try {
            const data = readInputFile(`${__dirname}/fixtures/invalid_slots.json`);
            validateFileData(data);
            fail("Should have thrown exception");
        } catch ({ err }) {
            expect(err.code).toBe(7);
        }
    });

    it("should fail if any subject's slots are empty", () => {
        try {
            const data = readInputFile(`${__dirname}/fixtures/empty_slots.json`);
            validateFileData(data);
            fail("Should have thrown exception");
        } catch ({ err }) {
            expect(err.code).toBe(8);
        }
    });

    it("should fail if any subject appear more than once", () => {
        try {
            const data = readInputFile(`${__dirname}/fixtures/duplicate_id.json`);
            validateFileData(data);
            fail("Should have thrown exception");
        } catch ({ err }) {
            expect(err.code).toBe(9);
        }
    });

    it("should fail if any subject's slots' item is not a String", () => {
        try {
            const data = readInputFile(`${__dirname}/fixtures/invalid_slot.json`);
            validateFileData(data);
            fail("Should have thrown exception");
        } catch ({ err }) {
            expect(err.code).toBe(10);
        }
    });
});
