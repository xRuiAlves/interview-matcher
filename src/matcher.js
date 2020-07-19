const match = (candidates, interviewers) => {
    const matrix = buildMatrix(candidates.length, interviewers.length);

    return "TO DO";
};

const buildMatrix = (M, N) => (
    Array(M).fill().map(() => Array(N).fill(0))
);

module.exports = {
    match,
};
