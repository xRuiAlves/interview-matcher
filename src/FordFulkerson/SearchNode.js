class SearchNode {
    constructor(id, depth, prev = null) {
        if (isNaN(id) && !id) {
            throw new Error("Missing node 'id'");
        }

        if (isNaN(depth) && !depth) {
            throw new Error("Missing node 'depth'");
        }

        if (prev !== null && !(prev instanceof SearchNode)) {
            throw new Error("Invalid 'prev' is not of type 'SearchNode'");
        }

        this.id = id;
        this.depth = depth;
        this.prev = prev;
    }
}

module.exports = SearchNode;
