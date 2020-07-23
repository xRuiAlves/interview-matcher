const INPUT_TYPE_FLAGS = require("../src/inputTypeFlags");

describe("Validate input types", () => {
    it("should feature an entry for each input type", () => {
        expect(Object.values(INPUT_TYPE_FLAGS).length).not.toBe(0);
        Object.values(INPUT_TYPE_FLAGS).forEach((flag) => {
            expect(typeof flag).toBe("string");
            expect(flag.substr(0, 2)).toBe("--");
        });
    });
});
