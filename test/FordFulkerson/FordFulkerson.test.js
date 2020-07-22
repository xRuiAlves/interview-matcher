const { getSlots, buildCapacitiesGraph, populateCapacitiesGraph, pruneCapacitiesGraph } = require("../../src/matcher");
const FordFulkerson = require("../../src/FordFulkerson/FordFulkerson");
const candidates = require("../fixtures/valid_candidates.json");
const interviewers = require("../fixtures/valid_interviewers.json");

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
