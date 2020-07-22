const { getSlots, buildCapacitiesGraph, populateCapacitiesGraph, pruneCapacitiesGraph } = require("../../src/matcher");
const FordFulkerson = require("../../src/FordFulkerson/FordFulkerson");
const SearchNode = require("../../src/FordFulkerson/SearchNode");
const candidates = require("../fixtures/valid_candidates.json");
const interviewers = require("../fixtures/valid_interviewers.json");
const candidates2 = require("../fixtures/valid_candidates_2.json");
const interviewers2 = require("../fixtures/valid_interviewers_2.json");

describe("Create ford fulkerson calculator", () => {
    const config = {
        interviewers_per_slot: 2,
        max_interviews_per_interviewer: 5,
    };

    const slots = getSlots(candidates, interviewers);
    const { capacities, graph_nodes_map, graph_info } = buildCapacitiesGraph(candidates, interviewers, slots);
    populateCapacitiesGraph(candidates, interviewers, slots, capacities, graph_nodes_map, config);
    pruneCapacitiesGraph(interviewers, capacities, graph_nodes_map, config);

    it("should create a ford fulkerson calculator", () => {
        const ff = new FordFulkerson(capacities, graph_info);
        expect(ff.capacities.length).toBe(capacities.length);
        expect(Object.entries(ff.graph_info).length).toBe(Object.entries(graph_info).length);
        expect(ff.source_node).toBe(0);
        expect(ff.sink_node).toBe(capacities.length - 1);

        expect(ff.flows.length).toBe(capacities.length);
        ff.flows.forEach((row) => {
            expect(row.length).toBe(capacities.length);
            row.forEach((elem) => {
                expect(elem).toBe(0);
            });
        });
    });

    it("should fail on invalid ford fulkerson calculator creation", () => {
        expect(() => {
            new FordFulkerson();
        }).toThrowError("Missing field 'capacities'");

        expect(() => {
            new FordFulkerson(capacities);
        }).toThrowError("Missing field 'graph_info'");

        expect(() => {
            new FordFulkerson(capacities, graph_info);
        }).not.toThrow();
    });
});

describe("Sort intervieweres by descending work amount", () => {
    it("should sort the interviewers by descending number of assigned slots", () => {
        const capacities = Array(12).fill().map(() => Array(12).fill(0));
        const graph_info = {
            interviewers: new Set([1, 2, 3]),
            slot_filters: new Set([4, 5, 6]),
            slots: new Set([7, 8, 9]),
            candidates: new Set([10]),
        };
        for (let interviewer = 1; interviewer <= 3; ++interviewer) {
            capacities[0][interviewer] = 5;
        }

        const ff = new FordFulkerson(capacities, graph_info);
        ff.flows[0][1] = 4;
        ff.flows[0][2] = 1;
        ff.flows[0][3] = 3;

        const sorted_interviewers = ff.sortInterviewersByDescendingWork();
        expect(sorted_interviewers.length).toBe(3);
        expect(sorted_interviewers[0]).toBe("1");
        expect(sorted_interviewers[1]).toBe("3");
        expect(sorted_interviewers[2]).toBe("2");


        const capacities2 = Array(13).fill().map(() => Array(13).fill(0));
        const graph_info2 = {
            interviewers: new Set([1, 2, 3, 4]),
            slot_filters: new Set([5, 6, 7]),
            slots: new Set([8, 9, 10]),
            candidates: new Set([11]),
        };
        for (let i = 1; i <= 4; ++i) {
            capacities2[0][i] = 5;
        }

        const ff2 = new FordFulkerson(capacities2, graph_info2);
        ff2.flows[0][1] = 0;
        ff2.flows[0][2] = 5;
        ff2.flows[0][3] = 2;
        ff2.flows[0][4] = 5;

        const sorted_interviewers2 = ff2.sortInterviewersByDescendingWork();
        expect(sorted_interviewers2.length).toBe(2);
        expect(sorted_interviewers2[0]).toBe("3");
        expect(sorted_interviewers2[1]).toBe("1");
    });
});

describe("Sort slots by ascending number of interviewers", () => {
    it("should sort the slot filters by ascending number of assigned interviewers", () => {
        const capacities = Array(12).fill().map(() => Array(12).fill(0));
        const graph_info = {
            interviewers: new Set([1, 2, 3]),
            slot_filters: new Set([4, 5, 6]),
            slots: new Set([7, 8, 9]),
            candidates: new Set([10]),
        };
        for (let slot_filter = 4; slot_filter <= 6; ++slot_filter) {
            capacities[slot_filter][11] = 2;
            capacities[slot_filter][slot_filter + 3] = 1;
        }

        const ff = new FordFulkerson(capacities, graph_info);
        ff.flows[4][7] = 1;
        ff.flows[4][11] = 1;
        ff.flows[5][8] = 1;

        const sorted_slot_filters = ff.sortSlotsByAscendingNumInterviewers();
        expect(sorted_slot_filters.length).toBe(3);
        expect(sorted_slot_filters[0]).toBe("6");
        expect(sorted_slot_filters[1]).toBe("5");
        expect(sorted_slot_filters[2]).toBe("4");


        const capacities2 = Array(14).fill().map(() => Array(14).fill(0));
        const graph_info2 = {
            interviewers: new Set([1, 2, 3]),
            slot_filters: new Set([4, 5, 6, 7]),
            slots: new Set([8, 9, 10, 11]),
            candidates: new Set([12]),
        };
        for (let slot_filter = 4; slot_filter <= 7; ++slot_filter) {
            capacities2[slot_filter][13] = 2;
            capacities2[slot_filter][slot_filter + 4] = 1;
        }

        const ff2 = new FordFulkerson(capacities2, graph_info2);
        ff2.flows[5][9] = 1;
        ff2.flows[5][13] = 2;
        ff2.flows[7][11] = 1;
        ff2.flows[7][13] = 2;
        ff2.flows[4][8] = 1;
        ff2.flows[6][10] = 1;
        ff2.flows[6][13] = 1;

        const sorted_slot_filters2 = ff2.sortSlotsByAscendingNumInterviewers();
        expect(sorted_slot_filters2.length).toBe(2);
        expect(sorted_slot_filters2[0]).toBe("4");
        expect(sorted_slot_filters2[1]).toBe("6");
    });
});

describe("Sort candidates by descending order of assigned slots", () => {
    it("should sort the candidates by ascending number of assigned slots (1 or 0)", () => {
        const capacities = Array(15).fill().map(() => Array(15).fill(0));
        const graph_info = {
            interviewers: new Set([1]),
            slot_filters: new Set([2, 3, 4]),
            slots: new Set([5, 6, 7]),
            candidates: new Set([8, 9, 10, 11, 12, 13]),
        };
        graph_info.candidates.forEach((candidate) => {
            capacities[candidate][14] = 1;
        });

        const ff = new FordFulkerson(capacities, graph_info);
        ff.flows[9][14] = 1;
        ff.flows[11][14] = 1;
        ff.flows[12][14] = 1;

        const sorted_slot_filters = ff.sortCandidatesByDescendingAssignedSlots();
        expect(sorted_slot_filters.length).toBe(6);
        expect(ff.flows[sorted_slot_filters[0]][14]).toBe(1);
        expect(ff.flows[sorted_slot_filters[1]][14]).toBe(1);
        expect(ff.flows[sorted_slot_filters[2]][14]).toBe(1);
        expect(ff.flows[sorted_slot_filters[3]][14]).toBe(0);
        expect(ff.flows[sorted_slot_filters[4]][14]).toBe(0);
        expect(ff.flows[sorted_slot_filters[5]][14]).toBe(0);
    });
});

describe("Build an incremental path from a graph search result", () => {
    it("should build the incremental path given the path's final search node", () => {
        const s1 = new SearchNode(1);
        const s2 = new SearchNode(2, s1);
        const s3 = new SearchNode(3, s2);
        const path = FordFulkerson.buildIncrementalPath(s3);

        expect(path.length).toBe(2);
        expect(path[0].from).toBe(s1.id);
        expect(path[0].to).toBe(s2.id);
        expect(path[1].from).toBe(s2.id);
        expect(path[1].to).toBe(s3.id);

        const s4 = new SearchNode(5);
        const s5 = new SearchNode(7, s4);
        const s6 = new SearchNode(0, s5);
        const s7 = new SearchNode(12, s6);
        const s8 = new SearchNode(9, s7);
        const path2 = FordFulkerson.buildIncrementalPath(s8);

        expect(path2.length).toBe(4);
        expect(path2[0].from).toBe(s4.id);
        expect(path2[path2.length - 1].to).toBe(s8.id);
        for (let i = 0; i < path2.length - 1; ++i) {
            expect(path2[i].to).toBe(path2[i + 1].from);
        }
    });

    it("should fail on missing / invalid type or of search node", () => {
        expect(() => {
            FordFulkerson.buildIncrementalPath();
        }).toThrow();

        expect(() => {
            FordFulkerson.buildIncrementalPath(0);
        }).toThrow();
    });
});

describe("Perform search to find an incremental path", () => {
    it("should fail to find a path when there isn't one available", () => {
        const capacities = Array(6).fill().map(() => Array(6).fill(0));
        const graph_info = {
            interviewers: new Set([1]),
            slot_filters: new Set([2]),
            slots: new Set([3]),
            candidates: new Set([4]),
        };
        const ff = new FordFulkerson(capacities, graph_info);

        const incremental_path = ff.searchIncrementalPath();
        expect(incremental_path).toBeNull();
    });

    it("should find a path when there is one", () => {
        const capacities = Array(6).fill().map(() => Array(6).fill(0));
        const graph_info = {
            interviewers: new Set([1]),
            slot_filters: new Set([2]),
            slots: new Set([3]),
            candidates: new Set([4]),
        };
        for (let i = 0; i < 5; ++i) {
            capacities[i][i + 1] = 1;
        }
        const ff = new FordFulkerson(capacities, graph_info);

        const incremental_path = ff.searchIncrementalPath();
        expect(incremental_path).not.toBeNull();
        expect(incremental_path.length).toBe(5);
        expect(incremental_path[0].from).toBe(0);
        expect(incremental_path[incremental_path.length - 1].to).toBe(5);
    });
});

describe("Calculate maximum flow of a capacity graph", () => {
    it("should return an empty flow graph when there are no flow paths available", () => {
        const capacities = Array(6).fill().map(() => Array(6).fill(0));
        const graph_info = {
            interviewers: new Set([1]),
            slot_filters: new Set([2]),
            slots: new Set([3]),
            candidates: new Set([4]),
        };
        const ff = new FordFulkerson(capacities, graph_info);

        const flows = ff.calcMaxFlow();
        expect(flows.length).toBe(6);
        flows.forEach((row) => {
            expect(row.length).toBe(6);
            row.forEach((elem) => {
                expect(elem).toBe(0);
            });
        });
    });

    it("should correctly calculate max flow for a given capacity graph", () => {
        for (let max_interviews_per_interviewer = 3; max_interviews_per_interviewer <= 5; ++max_interviews_per_interviewer) {
            const config = {
                interviewers_per_slot: 2,
                max_interviews_per_interviewer,
            };

            const slots = getSlots(candidates2, interviewers2);
            const { capacities, graph_nodes_map, graph_info } = buildCapacitiesGraph(candidates2, interviewers2, slots);
            populateCapacitiesGraph(candidates2, interviewers2, slots, capacities, graph_nodes_map, config);
            pruneCapacitiesGraph(interviewers2, capacities, graph_nodes_map, config);

            const ff = new FordFulkerson(capacities, graph_info);
            const flows = ff.calcMaxFlow();

            for (let interviewer = 1; interviewer <= 2; ++interviewer) {
                // source to interviewers
                expect(flows[0][interviewer]).toBe(3);

                // interviewers to slot filters
                for (let slot_filter = 3; slot_filter <= 5; ++slot_filter) {
                    expect(flows[interviewer][slot_filter]).toBe(1);
                }
                expect(flows[interviewer][6]).toBe(0);
            }

            // slot filters to slots and to sink
            for (let slot_filter = 3; slot_filter <= 5; ++slot_filter) {
                expect(flows[slot_filter][slot_filter + 4]).toBe(1);
                expect(flows[slot_filter][flows.length - 1]).toBe(config.interviewers_per_slot - 1);
            }
            expect(flows[6][10]).toBe(0);
            expect(flows[6][flows.length - 1]).toBe(0);

            // slots to candidates
            expect(flows[7][11]).toBe(1);
            expect(flows[7][12]).toBe(0);
            expect(flows[7][13]).toBe(0);
            expect(flows[8][11]).toBe(0);
            expect(flows[8][12]).toBe(1);
            expect(flows[8][13]).toBe(0);
            expect(flows[9][11]).toBe(0);
            expect(flows[9][12]).toBe(0);
            expect(flows[9][13]).toBe(1);

            // candidates to sink
            for (let candidate = 11; candidate <= 13; ++candidate) {
                expect(flows[candidate][14]).toBe(1);
            }
        }
    });
});
