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

    it("should shuffle the array", () => {
        const original_arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let was_shuffled = false;

        for (let i = 0; i < 20; ++i) {
            const shuffled_arr = shuffleArray(original_arr);
            if (shuffled_arr.toString() !== original_arr.toString()) {
                was_shuffled = true;
            }
        }

        expect(was_shuffled).toBe(true);
    });
});
