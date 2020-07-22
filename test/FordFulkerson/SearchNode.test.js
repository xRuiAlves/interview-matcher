const SearchNode = require("../../src/FordFulkerson/SearchNode");

describe("Create search node for graph usage", () => {
    it("should create a search node", () => {
        const node1 = new SearchNode(1);
        expect(node1.id).toBe(1);
        expect(node1.depth).toBe(0);
        expect(node1.prev).toBeNull();

        const node2 = new SearchNode(5, node1);
        expect(node2.id).toBe(5);
        expect(node2.depth).toBe(1);
        expect(node2.prev instanceof SearchNode).toBe(true);
        expect(node2.prev.id).toBe(1);
    });

    it("should fail on invalid search node creation", () => {
        expect(() => {
            new SearchNode();
        }).toThrowError("Missing node 'id'");

        expect(() => {
            new SearchNode(0);
        }).not.toThrow();

        expect(() => {
            new SearchNode(0, 0);
        }).toThrowError("Invalid 'prev' is not of type 'SearchNode'");
    });
});
