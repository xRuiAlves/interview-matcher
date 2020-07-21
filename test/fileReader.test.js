/* eslint-disable no-undef */
const { readInputFile, validateFileData } = require("../src/fileReader");

describe("Correct file reading and validating", () => {
    it("should read a well-formed valid file", () => {
        const file_name = `${__dirname}/fixtures/valid_candidates.json`;
        const data = readInputFile(file_name);
        expect(Array.isArray(data)).toBe(true);
    });

    it("should validate a valid file", () => {
        const file_name = `${__dirname}/fixtures/valid_candidates.json`;
        const data = readInputFile(file_name);
        expect(validateFileData(data)).toBe(true, file_name);
    });
});

describe("Detect invalid file format and/or structure", () => {
    it("should fail if input file is not JSON", () => {
        try {
            readInputFile(`${__dirname}/fixtures/not_json.txt`);
            fail("Should have thrown exception");
        } catch (e) {
            expect(e.err.code).toBe(2);
            expect(e.msg.includes("is not a valid JSON file")).toBe(true);
        }
    });

    it("should fail if input file is not Array", () => {
        try {
            const file_name = `${__dirname}/fixtures/invalid_json_format.json`;
            const data = readInputFile(file_name);
            validateFileData(data, file_name);
            fail("Should have thrown exception");
        } catch (e) {
            expect(e.err.code).toBe(3);
            expect(e.msg.includes("should be an options JSON Array")).toBe(true);
        }
    });

    it("should fail if any subject's id is missing", () => {
        try {
            const file_name = `${__dirname}/fixtures/missing_id.json`;
            const data = readInputFile(file_name);
            validateFileData(data, file_name);
            fail("Should have thrown exception");
        } catch (e) {
            expect(e.err.code).toBe(4);
            expect(e.msg.includes("subject num. 2 does not feature a required 'id' attribute")).toBe(true);
        }
    });

    it("should fail if any subject's id is not a String", () => {
        try {
            const file_name = `${__dirname}/fixtures/invalid_id.json`;
            const data = readInputFile(file_name);
            validateFileData(data, file_name);
            fail("Should have thrown exception");
        } catch (e) {
            expect(e.err.code).toBe(5);
            expect(e.msg.includes("subject num. 3 'id' is not a String")).toBe(true);
        }
    });

    it("should fail if any subject's slots are missing", () => {
        try {
            const file_name = `${__dirname}/fixtures/missing_slots.json`;
            const data = readInputFile(file_name);
            validateFileData(data, file_name);
            fail("Should have thrown exception");
        } catch (e) {
            expect(e.err.code).toBe(6);
            expect(e.msg.includes("subject num. 2 does not feature a required 'slots' attribute")).toBe(true);
        }
    });

    it("should fail if any subject's slots are not an Array", () => {
        try {
            const file_name = `${__dirname}/fixtures/invalid_slots.json`;
            const data = readInputFile(file_name);
            validateFileData(data, file_name);
            fail("Should have thrown exception");
        } catch (e) {
            expect(e.err.code).toBe(7);
            expect(e.msg.includes("subject num. 2 'slots' attribute should be an Array")).toBe(true);
        }
    });

    it("should fail if any subject's slots are empty", () => {
        try {
            const file_name = `${__dirname}/fixtures/empty_slots.json`;
            const data = readInputFile(file_name);
            validateFileData(data, file_name);
            fail("Should have thrown exception");
        } catch (e) {
            expect(e.err.code).toBe(8);
            expect(e.msg.includes("subject num. 1 'slots' Array is empty")).toBe(true);
        }
    });

    it("should fail if any subject appear more than once", () => {
        try {
            const file_name = `${__dirname}/fixtures/duplicate_id.json`;
            const data = readInputFile(file_name);
            validateFileData(data, file_name);
            fail("Should have thrown exception");
        } catch (e) {
            expect(e.err.code).toBe(9);
            expect(e.msg.includes("subject Duplicate Name is declared twice")).toBe(true);
        }
    });

    it("should fail if any subject's slots' item is not a String", () => {
        try {
            const file_name = `${__dirname}/fixtures/invalid_slot.json`;
            const data = readInputFile(file_name);
            validateFileData(data, file_name);
            fail("Should have thrown exception");
        } catch (e) {
            expect(e.err.code).toBe(10);
            expect(e.msg.includes("in subject num. 1, slot num. 1 is not a String")).toBe(true);
        }
    });
});
