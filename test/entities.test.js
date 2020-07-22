const { hashEntity, dehashEntity } = require("../src/entities");

describe("Hash and dehash entities (interviewer, candidate, slot, slot_filter)", () => {
    it("should hash entity", () => {
        expect(hashEntity("interviewer", "A")).toBe("interviewer_A");
        expect(hashEntity("candidate", "B")).toBe("candidate_B");
        expect(hashEntity("slot_filter", "C")).toBe("slot_filter_C");
        expect(hashEntity("slot", "D")).toBe("slot_D");
    });

    it("should reverse hash entity", () => {
        expect(dehashEntity("interviewer", "interviewer_A")).toBe("A");
        expect(dehashEntity("candidate", "candidate_B")).toBe("B");
        expect(dehashEntity("slot_filter", "slot_filter_C")).toBe("C");
        expect(dehashEntity("slot", "slot_D")).toBe("D");
    });

    it("should return original id after hashing and reverse hashing", () => {
        expect(dehashEntity("interviewer", hashEntity("interviewer", "A"))).toBe("A");
        expect(dehashEntity("candidate", hashEntity("candidate", "B"))).toBe("B");
        expect(dehashEntity("slot_filter", hashEntity("slot_filter", "C"))).toBe("C");
        expect(dehashEntity("slot", hashEntity("slot", "D"))).toBe("D");
    });
});
