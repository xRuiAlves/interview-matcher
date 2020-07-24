/* eslint-disable no-undef */
const { convertDoodleData, verifyDoodleSlotsMatching, convertDoodlesData, convertToDoodleEntity, doodlifyOutput } = require("../src/doodler");
const doodle_data = require("./fixtures/doodle/doodle_res.json");
const doodle_data_candidates = require("./fixtures/doodle/doodle_res_candidates_S.json");
const doodle_data_interviewers = require("./fixtures/doodle/doodle_res_interviewers_S.json");
const undoodlified_output = require("./fixtures/doodle/undoodlified_output.json");

describe("Convert doodle api data to interview-matcher data", () => {
    it("should extract all slots and participants", () => {
        const data = convertDoodleData(doodle_data);
        expect(data.participants.length).toBe(3);
        expect(data.slots.length).toBe(9);

        data.slots.forEach((slot) => {
            expect(slot.includes("-")).toBe(true);
        });

        expect(data.participants[0].id.includes("john doe")).toBe(true);
        expect(data.participants[0].slots.length).toBe(5);
        expect(data.participants[1].id.includes("jane doe")).toBe(true);
        expect(data.participants[1].slots.length).toBe(5);
        expect(data.participants[2].id.includes("peter pan")).toBe(true);
        expect(data.participants[2].slots.length).toBe(4);
    });

    it("should validate doodle data format", () => {
        try {
            convertDoodleData({ participants: doodle_data.participants });
            fail("Should have thrown exception");
        } catch (e) {
            expect(e.err.code).toBe(15);
            expect(e.msg).toBe("Doodle data 'options' field is missing.");
        }

        try {
            convertDoodleData({
                options: "options",
                participants: doodle_data.participants,
            });
            fail("Should have thrown exception");
        } catch (e) {
            expect(e.err.code).toBe(15);
            expect(e.msg).toBe("Doodle data 'options' field should be of type Array.");
        }

        try {
            convertDoodleData({ options: doodle_data.options });
            fail("Should have thrown exception");
        } catch (e) {
            expect(e.err.code).toBe(15);
            expect(e.msg).toBe("Doodle data 'participants' field is missing.");
        }

        try {
            convertDoodleData({
                options: doodle_data.options,
                participants: "participants",
            });
            fail("Should have thrown exception");
        } catch (e) {
            expect(e.err.code).toBe(15);
            expect(e.msg).toBe("Doodle data 'participants' field should be of type Array.");
        }

        expect(() =>
            convertDoodleData(doodle_data),
        ).not.toThrow();
    });
});

describe("Compare two doodle api results", () => {
    it("should validate two doodle that feature the same slots", () => {
        expect(verifyDoodleSlotsMatching(doodle_data_candidates, doodle_data_interviewers)).toBe(true);
    });

    it("should not validate two doodle featuring different slots", () => {
        expect(verifyDoodleSlotsMatching(doodle_data, doodle_data_candidates)).toBe(false);
        expect(verifyDoodleSlotsMatching(doodle_data, doodle_data_interviewers)).toBe(false);
    });
});

describe("Convert doodle candidates and interviewers to interview-matcher data format", () => {
    it("should throw if doodles' slot options do not match", () => {
        try {
            convertDoodlesData(doodle_data, doodle_data_candidates);
            fail("Should have thrown exception");
        } catch (e) {
            expect(e.err.code).toBe(16);
        }

        try {
            convertDoodlesData(doodle_data, doodle_data_interviewers);
            fail("Should have thrown exception");
        } catch (e) {
            expect(e.err.code).toBe(16);
        }
    });

    it("should extract formatted candidates and interviewers lists, featuring their slot options", () => {
        const { candidates, interviewers } = convertDoodlesData(doodle_data_candidates, doodle_data_interviewers);

        expect(Array.isArray(candidates)).toBe(true);
        expect(Array.isArray(interviewers)).toBe(true);

        expect(candidates.length).toBe(3);
        expect(interviewers.length).toBe(2);

        const participants_groups = [candidates, interviewers];

        participants_groups.forEach((participants) => {
            participants.forEach((participant) => {
                expect(typeof participant.id).toBe("string");
                expect(Array.isArray(participant.slots)).toBe(true);

                participant.slots.forEach((slot) => {
                    expect(typeof slot).toBe("string");
                });
            });
        });
    });
});

describe("Convert internal entity to doodle entity", () => {
    it("should convert internal entity to doodle entity", () => {
        expect(() => {
            convertToDoodleEntity("Candidate A");
        }).toThrowError("Missing entity separator");

        const doodle_entity1 = convertToDoodleEntity("Candidate A_1712034735");
        expect(doodle_entity1.name).toBe("Candidate A");
        expect(doodle_entity1.id).toBe("1712034735");

        const doodle_entity2 = convertToDoodleEntity("Interviewer B_1810429890");
        expect(doodle_entity2.name).toBe("Interviewer B");
        expect(doodle_entity2.id).toBe("1810429890");
    });
});

describe("Convert standard output format to doodle-like output format", () => {
    it("should convert standard output format to doodle-like output format", () => {
        const doodle_output = doodlifyOutput(undoodlified_output);
        expect(Array.isArray(doodle_output.matches)).toBe(true);
        expect(doodle_output.matches.length).toBe(3);

        doodle_output.matches.forEach((match) => {
            expect(match.slot).toBeDefined();
            expect(match.slot.start).toBeDefined();
            expect(typeof match.slot.start).toBe("string");
            expect(typeof match.slot.start.length).not.toBe(0);
            expect(match.slot.end).toBeDefined();
            expect(typeof match.slot.end).toBe("string");
            expect(typeof match.slot.end.length).not.toBe(0);

            expect(match.candidate).toBeDefined();
            expect(match.candidate.name).toBeDefined();
            expect(typeof match.candidate.name).toBe("string");
            expect(typeof match.candidate.name.length).not.toBe(0);
            expect(match.candidate.id).toBeDefined();
            expect(typeof match.candidate.id).toBe("string");
            expect(typeof match.candidate.id.length).not.toBe(0);

            expect(match.interviewers).toBeDefined();
            expect(Array.isArray(match.interviewers)).toBe(true);
            match.interviewers.forEach((interviewer) => {
                expect(interviewer.name).toBeDefined();
                expect(typeof interviewer.name).toBe("string");
                expect(typeof interviewer.name.length).not.toBe(0);
                expect(interviewer.id).toBeDefined();
                expect(typeof interviewer.id).toBe("string");
                expect(typeof interviewer.id.length).not.toBe(0);
            });
        });

        expect(Object.entries(doodle_output.interviews_per_interviewer).length).toBe(2);
        Object.entries(doodle_output.interviews_per_interviewer).forEach(([name, count]) => {
            expect(typeof name).toBe("string");
            expect(name.includes("_")).toBe(false);
            expect(typeof count).toBe("number");
        });
    });
});
