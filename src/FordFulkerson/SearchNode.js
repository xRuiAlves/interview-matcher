class SearchNode {
    constructor(id, prev = null) {
        if (isNaN(id) && !id) {
            throw new Error("Missing node 'id'");
        }

        if (prev !== null && !(prev instanceof SearchNode)) {
            throw new Error("Invalid 'prev' is not of type 'SearchNode'");
        }

        this.id = id;
        this.prev = prev;
        this.depth = prev === null ? 0 : prev.depth + 1;
    }
}

module.exports = SearchNode;
