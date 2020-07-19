const match = (candidates, interviewers) => {
    const matrix = buildMatchesMatrix(candidates, interviewers);
    console.log(matrix);
    return "TO DO";
};

const buildMatchesMatrix = (M, N) => {
    Array(M).fill().map(() => Array(N).fill(0));
};

module.exports = {
    match,
    buildMatchesMatrix,
};
