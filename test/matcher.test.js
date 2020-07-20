const { getSlots, buildMatchesMatrix, populateCapacitiesGraph } = require("../src/matcher");
const candidates = require("./fixtures/valid_candidates.json");
const interviewers = require("./fixtures/valid_interviewers.json");
const candidates2 = require("./fixtures/valid_candidates_2.json");
const interviewers2 = require("./fixtures/valid_interviewers_2.json");

describe("Extract all existing slots", () => {
    it("should get all slots from candidates/interviewers options", () => {
        const slots = getSlots(candidates, interviewers);
        expect(slots.length).toBe(5);
        ["slot 1", "slot 2", "slot 3", "slot 4", "slot 5"].forEach((slot) => {
            expect(slots.includes(slot)).toBe(true);
        });
    });
});

describe("Build matches matrix for ford fulkerson algorithm applying", () => {
    it("should build a correctly-sized capacities graph", () => {
        const slots = getSlots(candidates, interviewers);
        const capacities1 = buildMatchesMatrix(candidates, interviewers, slots).capacities;
        expect(capacities1.length).toBe(19);

        capacities1.forEach((row) => {
            expect(row.length).toBe(19);
        });

        const slots2 = getSlots(candidates2, interviewers2);
        const capacities2 = buildMatchesMatrix(candidates2, interviewers2, slots2).capacities;
        expect(capacities2.length).toBe(15);

        capacities2.forEach((row) => {
            expect(row.length).toBe(15);
        });
    });

    it("should build a well-formed and valid grapth entities map", () => {
        const slots = getSlots(candidates, interviewers);
        const graph_entities_map1 = buildMatchesMatrix(candidates, interviewers, slots).graph_entities_map;
        expect(Object.keys(graph_entities_map1).length).toBe(19);

        let offset = 0;
        expect(graph_entities_map1["source"]).toBe(offset);

        offset += 1;
        interviewers.forEach((interviewer, i) => {
            expect(graph_entities_map1[`interviewer_${interviewer.id}`]).toBe(offset + i);
        });

        offset += interviewers.length;
        slots.forEach((slot, i) => {
            expect(graph_entities_map1[`slot_filter_${slot}`]).toBe(offset + i);
        });

        offset += slots.length;
        slots.forEach((slot, i) => {
            expect(graph_entities_map1[`slot_${slot}`]).toBe(offset + i);
        });

        offset += slots.length;
        candidates.forEach((candidate, i) => {
            expect(graph_entities_map1[`candidate_${candidate.id}`]).toBe(offset + i);
        });

        offset += candidates.length;
        expect(graph_entities_map1["sink"]).toBe(offset);


        const slots2 = getSlots(candidates2, interviewers2);
        const graph_entities_map2 = buildMatchesMatrix(candidates2, interviewers2, slots2).graph_entities_map;
        expect(Object.keys(graph_entities_map2).length).toBe(15);

        offset = 0;
        expect(graph_entities_map2["source"]).toBe(offset);

        offset += 1;
        interviewers2.forEach((interviewer, i) => {
            expect(graph_entities_map2[`interviewer_${interviewer.id}`]).toBe(offset + i);
        });

        offset += interviewers2.length;
        slots2.forEach((slot, i) => {
            expect(graph_entities_map2[`slot_filter_${slot}`]).toBe(offset + i);
        });

        offset += slots2.length;
        slots2.forEach((slot, i) => {
            expect(graph_entities_map2[`slot_${slot}`]).toBe(offset + i);
        });

        offset += slots2.length;
        candidates2.forEach((candidate, i) => {
            expect(graph_entities_map2[`candidate_${candidate.id}`]).toBe(offset + i);
        });

        offset += candidates2.length;
        expect(graph_entities_map2["sink"]).toBe(offset);
    });
});

describe("Populate ford fulkerson algorithm capacity matrix", () => {
    it("should correctly build capacity matrix for given input scenario", () => {
        const config = {
            interviewers_per_slot: 3,
            max_interviews_per_interviewer: 5,
        };

        const slots = getSlots(candidates, interviewers);
        const { capacities, graph_entities_map } = buildMatchesMatrix(candidates, interviewers, slots);
        populateCapacitiesGraph(candidates, interviewers, slots, capacities, graph_entities_map, config);

        expect(capacities.length).toBe(19);
        expect(capacities[0].toString()).toBe("0,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0");
        expect(capacities[1].toString()).toBe("0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0");
        expect(capacities[2].toString()).toBe("0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0");
        expect(capacities[3].toString()).toBe("0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0");
        expect(capacities[4].toString()).toBe("0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,2");
        expect(capacities[5].toString()).toBe("0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2");
        expect(capacities[6].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,2");
        expect(capacities[7].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,2");
        expect(capacities[8].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,2");
        expect(capacities[9].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0");
        expect(capacities[10].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0");
        expect(capacities[11].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0");
        expect(capacities[12].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0");
        expect(capacities[13].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0");
        expect(capacities[14].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1");
        expect(capacities[15].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1");
        expect(capacities[16].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1");
        expect(capacities[17].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1");
        expect(capacities[18].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0");
    });

    it("should correctly build capacity matrix for given input scenario", () => {
        const config = {
            interviewers_per_slot: 4,
            max_interviews_per_interviewer: 6,
        };

        const slots = getSlots(candidates2, interviewers2);
        const { capacities, graph_entities_map } = buildMatchesMatrix(candidates2, interviewers2, slots);
        populateCapacitiesGraph(candidates2, interviewers2, slots, capacities, graph_entities_map, config);

        expect(capacities.length).toBe(15);
        expect(capacities[0].toString()).toBe("0,6,6,0,0,0,0,0,0,0,0,0,0,0,0");
        expect(capacities[1].toString()).toBe("0,0,0,1,1,1,0,0,0,0,0,0,0,0,0");
        expect(capacities[2].toString()).toBe("0,0,0,1,1,1,1,0,0,0,0,0,0,0,0");
        expect(capacities[3].toString()).toBe("0,0,0,0,0,0,0,1,0,0,0,0,0,0,3");
        expect(capacities[4].toString()).toBe("0,0,0,0,0,0,0,0,1,0,0,0,0,0,3");
        expect(capacities[5].toString()).toBe("0,0,0,0,0,0,0,0,0,1,0,0,0,0,3");
        expect(capacities[6].toString()).toBe("0,0,0,0,0,0,0,0,0,0,1,0,0,0,3");
        expect(capacities[7].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,1,0,0,0");
        expect(capacities[8].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,1,1,1,0");
        expect(capacities[9].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,1,0");
        expect(capacities[10].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,0,0");
        expect(capacities[11].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,0,1");
        expect(capacities[12].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,0,1");
        expect(capacities[13].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,0,1");
        expect(capacities[14].toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,0,0");
    });
});
