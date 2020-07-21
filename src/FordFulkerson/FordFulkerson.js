/* eslint-disable no-constant-condition */
const SearchNode = require("./SearchNode");

class FordFulkerson {
    constructor(capacities, graph_info) {
        this.capacities = capacities;
        this.graph_info = graph_info;
        this.flows = Array(capacities.length).fill().map(() => Array(capacities.length).fill(0));

        this.source_node = 0;
        this.sink_node = capacities.length - 1;
    }

    calcMaxFlow() {
        while (true) {
            const incremental_path = this.searchIncrementalPath();
            if (!incremental_path) {
                break;
            }

            incremental_path.forEach(({ from, to }) => {
                ++this.flows[from][to];
                --this.flows[to][from];
            });
        }
    }

    searchIncrementalPath() {
        // const visited = new Set();
        const to_visit = [];

        to_visit.push(new SearchNode(this.source_node, 0));

        // while (!(to_visit.length === 0)) {
        //     const node = to_visit.pop();

        //     if (!visited.has(node.id)) {

        //     }
        // }
    }
}

module.exports = FordFulkerson;
