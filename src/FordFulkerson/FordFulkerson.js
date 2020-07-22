/* eslint-disable no-constant-condition */
const SearchNode = require("./SearchNode");

class FordFulkerson {
    constructor(capacities, graph_info) {
        if (!capacities) {
            throw new Error("Missing field 'capacities'");
        }

        if (!graph_info) {
            throw new Error("Missing field 'graph_info'");
        }

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

        return this.flows;
    }

    searchIncrementalPath() {
        const visited = new Set();
        const to_visit = [];

        to_visit.push(new SearchNode(this.source_node));

        while (!(to_visit.length === 0)) {
            const node = to_visit.pop();

            if (!visited.has(node.id)) {
                visited.add(node.id);

                if (node.depth === 0) {
                    const interviewers = this.sortInterviewersByDescendingWork();
                    interviewers.forEach((interviewer) => {
                        const residual_val = this.capacities[node.id][interviewer] - this.flows[node.id][interviewer];
                        if (residual_val > 0) {
                            to_visit.push(new SearchNode(interviewer, node));
                        }
                    });
                } else if (node.depth === 1) {
                    const slot_filters = this.sortSlotsByAscendingNumInterviewers();
                    slot_filters.forEach((slot_filter) => {
                        const residual_val = this.capacities[node.id][slot_filter] - this.flows[node.id][slot_filter];
                        if (residual_val > 0) {
                            to_visit.push(new SearchNode(slot_filter, node));
                        }
                    });
                } else {
                    for (let i = 0; i < this.capacities.length; ++i) {
                        const residual_val = this.capacities[node.id][i] - this.flows[node.id][i];
                        if (residual_val > 0) {
                            const neighbor = new SearchNode(i, node);
                            to_visit.push(neighbor);
                            if (neighbor.id === this.sink_node) {
                                return FordFulkerson.buildIncrementalPath(neighbor);
                            }
                        }
                    }
                }
            }
        }

        return null;
    }

    sortInterviewersByDescendingWork() {
        const interviewers_work_count = {};
        this.graph_info.interviewers.forEach((interviewer) => {
            const residual_val = this.capacities[0][interviewer] - this.flows[0][interviewer];
            interviewers_work_count[interviewer] = residual_val;
        });

        return Object.entries(interviewers_work_count)
            .filter(([_id, count]) => count > 0)
            .sort(([_id1, count1], [_id2, count2]) => count1 - count2)
            .map(([id, _count]) => id);
    }

    sortSlotsByAscendingNumInterviewers() {
        const slots_interviewers_count = {};
        this.graph_info.slot_filters.forEach((slot) => {
            const slot_id = parseInt(slot, 10);
            slots_interviewers_count[slot_id] = this.capacities[slot_id][this.capacities.length - 1]
                - this.flows[slot_id][this.flows.length - 1];
            slots_interviewers_count[slot_id] += this.capacities[slot_id][slot_id + this.graph_info.slot_filters.size]
                - this.flows[slot_id][slot_id + this.graph_info.slot_filters.size];
        });

        return Object.entries(slots_interviewers_count)
            .filter(([_id, count]) => count > 0)
            .sort(([_id1, count1], [_id2, count2]) => count2 - count1)
            .map(([id, _count]) => id);
    }

    static buildIncrementalPath(path_end) {
        let current_node = path_end;
        const path = [];

        while (current_node.prev !== null) {
            path.push({
                from: current_node.prev.id,
                to: current_node.id,
            });
            current_node = current_node.prev;
        }

        return path.reverse();
    }
}

module.exports = FordFulkerson;
