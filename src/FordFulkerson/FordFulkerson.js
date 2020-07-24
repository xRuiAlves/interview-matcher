/* eslint-disable no-constant-condition */
const SearchNode = require("./SearchNode");

/**
 * Ford Fulkerson network max-flow algorithm for interview matching
 */
class FordFulkerson {
    /**
     * FordFulkerson constructor
     * @param {Matrix} capacities
     * @param {Object} graph_info
     * @throws {Error}
     */
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

    /**
     * Compute maximum flow in interview matching graph
     * @returns {Matrix} Interview matches flow matrix
     */
    calcMaxFlow() {
        while (true) {
            const incremental_path = this.searchPathFromInterviewer();
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

    /**
     * Search graph incremental path starting in interviewer node
     * @returns {Array} Incremental path if existent, null otherwise
     */
    searchPathFromInterviewer() {
        const interviewers = this.sortInterviewersByAscendingWork();

        for (const interviewer of interviewers) {
            const residual_val = this.capacities[this.source_node][interviewer] - this.flows[this.source_node][interviewer];
            if (residual_val > 0) {
                const incremental_path = this.searchIncrementalPath(interviewer);
                if (incremental_path !== null) {
                    incremental_path.unshift({
                        from: this.source_node,
                        to: incremental_path[0].from,
                    });
                    return incremental_path;
                }
            }
        }

        return null;
    }

    /**
     * Search graph incremental path
     * @param {Integer} starting_node_id Defaults to 0
     * @returns {Array} Incremental path if existent, null otherwise
     */
    searchIncrementalPath(starting_node_id = 0) {
        const visited = new Set();
        const to_visit = [];

        to_visit.push(new SearchNode(starting_node_id));

        while (!(to_visit.length === 0)) {
            const node = to_visit.shift();

            if (node.id === this.sink_node) {
                return FordFulkerson.buildIncrementalPath(node);
            }

            if (!visited.has(node.id)) {
                visited.add(node.id);

                if (node.id === this.source_node) {
                    const interviewers = this.sortInterviewersByAscendingWork();
                    interviewers.forEach((interviewer) => {
                        const residual_val = this.capacities[node.id][interviewer] - this.flows[node.id][interviewer];
                        if (residual_val > 0) {
                            to_visit.push(new SearchNode(interviewer, node));
                        }
                    });
                } else if (this.graph_info.interviewers.has(node.id)) {
                    const slot_filters = this.sortSlotsByDescendingNumInterviewers();
                    slot_filters.forEach((slot_filter) => {
                        const residual_val = this.capacities[node.id][slot_filter] - this.flows[node.id][slot_filter];
                        if (residual_val > 0) {
                            to_visit.push(new SearchNode(slot_filter, node));
                        }
                    });
                } else if (this.graph_info.slot_filters.has(node.id)) {
                    for (let i = this.capacities.length - 1; i >= 0; --i) {
                        const residual_val = this.capacities[node.id][i] - this.flows[node.id][i];
                        if (residual_val > 0) {
                            if (i === this.sink_node && this.flows[node.id][node.id + this.graph_info.slot_filters.size] === 0) {
                                continue;
                            }
                            const neighbor = new SearchNode(i, node);
                            to_visit.push(neighbor);
                        }
                    }
                } else if (this.graph_info.slots.has(node.id)) {
                    const candidates = this.sortCandidatesByAscendingAssignedSlots();
                    const slot_filters = [...this.graph_info.slot_filters];
                    const neighbors = candidates.concat(slot_filters);

                    neighbors.forEach((i) => {
                        const residual_val = this.capacities[node.id][i] - this.flows[node.id][i];
                        if (residual_val > 0) {
                            const neighbor = new SearchNode(i, node);
                            to_visit.push(neighbor);
                        }
                    });
                } else {
                    for (let i = this.capacities.length - 1; i >= 0; --i) {
                        const residual_val = this.capacities[node.id][i] - this.flows[node.id][i];
                        if (residual_val > 0) {
                            const neighbor = new SearchNode(i, node);
                            to_visit.push(neighbor);
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * Sort interviewers by ascending number of currently assigned interview slots
     * @returns {Array} Interviewer node ids sorted by ascending number of assigned interview slots
     */
    sortInterviewersByAscendingWork() {
        const interviewers_work_count = {};
        this.graph_info.interviewers.forEach((interviewer) => {
            const residual_val = this.capacities[0][interviewer] - this.flows[0][interviewer];
            interviewers_work_count[interviewer] = residual_val;
        });

        return Object.entries(interviewers_work_count)
            .filter(([_id, count]) => count > 0)
            .sort(([_id1, count1], [_id2, count2]) => count2 - count1)
            .map(([id, _count]) => parseInt(id, 10));
    }

    /**
     * Sort slots by descending number of currently assigned interviewers
     * @returns {Array} Slot node ids sorted by descending number of assigned interviewers
     */
    sortSlotsByDescendingNumInterviewers() {
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
            .sort(([_id1, count1], [_id2, count2]) => count1 - count2)
            .map(([id, _count]) => parseInt(id, 10));
    }


    /**
     * Sort candidates by ascending number of currently assigned slots (either has 1 slot assigned or none)
     * @returns {Array} Candidate node ids sorted by ascending number of assigned slots
     */
    sortCandidatesByAscendingAssignedSlots() {
        const candidates = [];
        this.graph_info.candidates.forEach((candidate) => {
            if (this.flows[candidate][this.sink_node] === 1) {
                candidates.push(candidate);
            } else {
                candidates.unshift(candidate);
            }
        });

        return candidates;
    }

    /**
     * Build an incremental path
     * @param {SearchNode} path_end
     * @returns {Array} Incremental path
     */
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
