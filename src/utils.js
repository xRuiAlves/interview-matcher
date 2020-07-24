const shuffleArray = (arr) => {
    const shuffled_arr = [...arr];

    for (let i = shuffled_arr.length - 1; i > 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = shuffled_arr[i];
        shuffled_arr[i] = shuffled_arr[j];
        shuffled_arr[j] = temp;
    }

    return shuffled_arr;
};

module.exports = {
    shuffleArray,
};
