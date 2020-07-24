const { shuffleArray } = require("../src/utils");

describe("Shuffle an array", () => {
    it("should maintain the array size and elements", () => {
        const original_arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const shuffled_arr = shuffleArray(original_arr);

        expect(shuffled_arr.length).toBe(original_arr.length);
        shuffled_arr.forEach((elem) => {
            expect(original_arr.includes(elem)).toBe(true);
        });
    });
});
