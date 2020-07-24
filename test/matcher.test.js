const {
    match, getSlots, buildCapacitiesGraph, populateCapacitiesGraph, pruneCapacitiesGraph,
    canInterviewerAttendSlot, countInterviewersTotalWork, mapIdToSlots, mapSlotsToIds,
    improveMatching, trySlotSwapBetweenInterviewers, tryCandidateSlotSwap,
} = require("../src/matcher");
const { convertDoodlesData } = require("../src/doodler");
const { hashEntity } = require("../src/entities");
const candidates = require("./fixtures/valid_candidates.json");
const interviewers = require("./fixtures/valid_interviewers.json");
const candidates2 = require("./fixtures/valid_candidates_2.json");
const interviewers2 = require("./fixtures/valid_interviewers_2.json");
const candidates3 = require("./fixtures/valid_candidates_3.json");
const interviewers3 = require("./fixtures/valid_interviewers_3.json");
const candidates4 = require("./fixtures/valid_candidates_4.json");
const interviewers4 = require("./fixtures/valid_interviewers_4.json");
const candidates5 = require("./fixtures/valid_candidates_5.json");
const interviewers5 = require("./fixtures/valid_interviewers_5.json");
const candidates6 = require("./fixtures/valid_candidates_6.json");
const interviewers6 = require("./fixtures/valid_interviewers_6.json");
const candidates7 = require("./fixtures/valid_candidates_7.json");
const interviewers7 = require("./fixtures/valid_interviewers_7.json");
const doodle_candidates_M = require("./fixtures/doodle/doodle_res_candidates_M.json");
const doodle_interviewers_M = require("./fixtures/doodle/doodle_res_interviewers_M.json");
const doodle_candidates_L = require("./fixtures/doodle/doodle_res_candidates_L.json");
const doodle_interviewers_L = require("./fixtures/doodle/doodle_res_interviewers_L.json");
const doodle_candidates_XL = require("./fixtures/doodle/doodle_res_candidates_XL.json");
const doodle_interviewers_XL = require("./fixtures/doodle/doodle_res_interviewers_XL.json");


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
        const capacities1 = buildCapacitiesGraph(candidates, interviewers, slots).capacities;
        expect(capacities1.length).toBe(19);

        capacities1.forEach((row) => {
            expect(row.length).toBe(19);
        });

        const slots2 = getSlots(candidates2, interviewers2);
        const capacities2 = buildCapacitiesGraph(candidates2, interviewers2, slots2).capacities;
        expect(capacities2.length).toBe(15);

        capacities2.forEach((row) => {
            expect(row.length).toBe(15);
        });
    });

    it("should build a well-formed and valid grapth entities map", () => {
        const slots = getSlots(candidates, interviewers);
        const graph_nodes_map1 = buildCapacitiesGraph(candidates, interviewers, slots).graph_nodes_map;
        expect(Object.keys(graph_nodes_map1).length).toBe(19);

        let offset = 0;
        expect(graph_nodes_map1["source"]).toBe(offset);

        offset += 1;
        interviewers.forEach((interviewer, i) => {
            expect(graph_nodes_map1[hashEntity("interviewer", interviewer.id)]).toBe(offset + i);
        });

        offset += interviewers.length;
        slots.forEach((slot, i) => {
            expect(graph_nodes_map1[hashEntity("slot_filter", slot)]).toBe(offset + i);
        });

        offset += slots.length;
        slots.forEach((slot, i) => {
            expect(graph_nodes_map1[hashEntity("slot", slot)]).toBe(offset + i);
        });

        offset += slots.length;
        candidates.forEach((candidate, i) => {
            expect(graph_nodes_map1[hashEntity("candidate", candidate.id)]).toBe(offset + i);
        });

        offset += candidates.length;
        expect(graph_nodes_map1["sink"]).toBe(offset);


        const slots2 = getSlots(candidates2, interviewers2);
        const graph_nodes_map2 = buildCapacitiesGraph(candidates2, interviewers2, slots2).graph_nodes_map;
        expect(Object.keys(graph_nodes_map2).length).toBe(15);

        offset = 0;
        expect(graph_nodes_map2["source"]).toBe(offset);

        offset += 1;
        interviewers2.forEach((interviewer, i) => {
            expect(graph_nodes_map2[hashEntity("interviewer", interviewer.id)]).toBe(offset + i);
        });

        offset += interviewers2.length;
        slots2.forEach((slot, i) => {
            expect(graph_nodes_map2[hashEntity("slot_filter", slot)]).toBe(offset + i);
        });

        offset += slots2.length;
        slots2.forEach((slot, i) => {
            expect(graph_nodes_map2[hashEntity("slot", slot)]).toBe(offset + i);
        });

        offset += slots2.length;
        candidates2.forEach((candidate, i) => {
            expect(graph_nodes_map2[hashEntity("candidate", candidate.id)]).toBe(offset + i);
        });

        offset += candidates2.length;
        expect(graph_nodes_map2["sink"]).toBe(offset);
    });

    it("should map entity types to node ids", () => {
        const slots = getSlots(candidates, interviewers);
        const graph_info1 = buildCapacitiesGraph(candidates, interviewers, slots).graph_info;

        expect(graph_info1.interviewers.size).toBe(3);
        expect(graph_info1.slot_filters.size).toBe(5);
        expect(graph_info1.slots.size).toBe(5);
        expect(graph_info1.candidates.size).toBe(4);

        [1, 2, 3].forEach((i) => {
            expect(graph_info1.interviewers.has(i));
        });

        [4, 5, 6, 7, 8].forEach((i) => {
            expect(graph_info1.slot_filters.has(i));
        });

        [9, 10, 11, 12, 13].forEach((i) => {
            expect(graph_info1.slots.has(i));
        });

        [14, 15, 16, 17].forEach((i) => {
            expect(graph_info1.candidates.has(i));
        });

        const slots2 = getSlots(candidates2, interviewers2);
        const graph_info2 = buildCapacitiesGraph(candidates2, interviewers2, slots2).graph_info;

        expect(graph_info2.interviewers.size).toBe(2);
        expect(graph_info2.slot_filters.size).toBe(4);
        expect(graph_info2.slots.size).toBe(4);
        expect(graph_info2.candidates.size).toBe(3);

        [1, 2].forEach((i) => {
            expect(graph_info2.interviewers.has(i));
        });

        [3, 4, 5, 6].forEach((i) => {
            expect(graph_info2.slot_filters.has(i));
        });

        [7, 8, 9, 10].forEach((i) => {
            expect(graph_info2.slots.has(i));
        });

        [11, 12, 13].forEach((i) => {
            expect(graph_info2.candidates.has(i));
        });
    });
});

describe("Populate ford fulkerson capacity matrix", () => {
    it("should correctly build capacity matrix for given input scenario", () => {
        const config = {
            interviewers_per_slot: 3,
            max_interviews_per_interviewer: 5,
        };

        const slots = getSlots(candidates, interviewers);
        const { capacities, graph_nodes_map } = buildCapacitiesGraph(candidates, interviewers, slots);
        populateCapacitiesGraph(candidates, interviewers, slots, capacities, graph_nodes_map, config);

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
        const { capacities, graph_nodes_map } = buildCapacitiesGraph(candidates2, interviewers2, slots);
        populateCapacitiesGraph(candidates2, interviewers2, slots, capacities, graph_nodes_map, config);

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


describe("Prune ford fulkerson capacity matrix with unfeasible slots", () => {
    it("should prune the unfeasible slot", () => {
        const config = {
            interviewers_per_slot: 2,
            max_interviews_per_interviewer: 6,
        };

        const slots = getSlots(candidates2, interviewers2);
        const { capacities, graph_nodes_map } = buildCapacitiesGraph(candidates2, interviewers2, slots);
        populateCapacitiesGraph(candidates2, interviewers2, slots, capacities, graph_nodes_map, config);

        const original_capacities = JSON.parse(JSON.stringify(capacities));

        pruneCapacitiesGraph(interviewers2, capacities, graph_nodes_map, config);
        const updated_capacity_index = graph_nodes_map["slot_filter_slot 4"];

        for (let i = 0; i < capacities.length; ++i) {
            if (i !== 2) {
                expect(capacities[i].toString()).toBe(original_capacities[i].toString());
            }
        }

        for (let i = 0; i < capacities[2].length; ++i) {
            if (i !== updated_capacity_index) {
                expect(capacities[2][i]).toBe(original_capacities[2][i]);
            }
        }

        expect(capacities[2][updated_capacity_index]).not.toBe(original_capacities[2][updated_capacity_index]);
        expect(capacities[2][updated_capacity_index]).toBe(0);
    });

    it("should prune the unfeasible slots", () => {
        const config = {
            interviewers_per_slot: 3,
            max_interviews_per_interviewer: 6,
        };

        const slots = getSlots(candidates2, interviewers2);
        const { capacities, graph_nodes_map } = buildCapacitiesGraph(candidates2, interviewers2, slots);
        populateCapacitiesGraph(candidates2, interviewers2, slots, capacities, graph_nodes_map, config);

        const original_capacities = JSON.parse(JSON.stringify(capacities));

        pruneCapacitiesGraph(interviewers2, capacities, graph_nodes_map, config);
        const updated_capacity_indexes = new Set([
            graph_nodes_map["slot_filter_slot 1"],
            graph_nodes_map["slot_filter_slot 2"],
            graph_nodes_map["slot_filter_slot 3"],
            graph_nodes_map["slot_filter_slot 4"],
        ]);

        for (let i = 0; i < capacities.length; ++i) {
            if (i !== 1 && i !== 2) {
                expect(capacities[i].toString()).toBe(original_capacities[i].toString());
            }
        }

        for (let interviewer = 1; interviewer <= 2; ++interviewer) {
            for (let i = 0; i < capacities[interviewer].length; ++i) {
                if (!updated_capacity_indexes.has(i)) {
                    expect(capacities[interviewer][i]).toBe(original_capacities[interviewer][i]);
                } else {
                    expect(capacities[interviewer][i]).toBe(0);
                }
            }
        }
    });
});


describe("Build all matches from given flow results", () => {
    it("should return no matches if no assignment is possible", () => {
        const config = {
            interviewers_per_slot: 3,
            max_interviews_per_interviewer: 5,
        };

        const output = match(candidates3, interviewers3, config);
        expect(output.matches.length).toBe(0);
        expect(Object.entries(output.interviews_per_interviewer).length).toBe(interviewers3.length);
        Object.entries(output.interviews_per_interviewer).forEach(([_name, count]) => {
            expect(count).toBe(0);
        });
    });

    it("should return all posible matches depending on given configuration", () => {
        const visited_slots = new Set();
        const visited_candidates = new Set();

        const output1 = match(candidates2, interviewers2, {
            interviewers_per_slot: 2,
            max_interviews_per_interviewer: 3,
        });
        expect(output1.matches.length).toBe(3);
        output1.matches.forEach((match) => {
            expect(match.interviewers.length).toBe(2);
            expect(visited_slots.has(match.slot)).toBe(false);
            expect(visited_candidates.has(match.candidate)).toBe(false);
            visited_slots.add(match.slot);
            visited_candidates.add(match.candidate);
        });
        expect(Object.entries(output1.interviews_per_interviewer).length).toBe(interviewers2.length);
        Object.entries(output1.interviews_per_interviewer).forEach(([name, count]) => {
            expect(typeof name).toBe("string");
            expect(typeof count).toBe("number");
        });
        visited_slots.clear();
        visited_candidates.clear();

        const output2 = match(candidates2, interviewers2, {
            interviewers_per_slot: 2,
            max_interviews_per_interviewer: 2,
        });
        expect(output2.matches.length).toBe(2);
        output2.matches.forEach((match) => {
            expect(match.interviewers.length).toBe(2);
            expect(visited_slots.has(match.slot)).toBe(false);
            expect(visited_candidates.has(match.candidate)).toBe(false);
            visited_slots.add(match.slot);
            visited_candidates.add(match.candidate);
        });
        expect(Object.values(output2.interviews_per_interviewer).length).toBe(interviewers2.length);
        visited_slots.clear();
        visited_candidates.clear();

        const output3 = match(candidates2, interviewers2, {
            interviewers_per_slot: 3,
            max_interviews_per_interviewer: 3,
        });
        expect(output3.matches.length).toBe(0);

        const output4 = match(candidates, interviewers, {
            interviewers_per_slot: 2,
            max_interviews_per_interviewer: 5,
        });
        expect(output4.matches.length).toBe(1);
        output4.matches.forEach((match) => {
            expect(match.interviewers.length).toBe(2);
            expect(visited_slots.has(match.slot)).toBe(false);
            expect(visited_candidates.has(match.candidate)).toBe(false);
            visited_slots.add(match.slot);
            visited_candidates.add(match.candidate);
        });
        expect(Object.values(output4.interviews_per_interviewer).length).toBe(interviewers.length);
        visited_slots.clear();
        visited_candidates.clear();

        const output5 = match(candidates, interviewers, {
            interviewers_per_slot: 1,
            max_interviews_per_interviewer: 2,
        });
        expect(output5.matches.length).toBe(4);
        output5.matches.forEach((match) => {
            expect(match.interviewers.length).toBe(1);
            expect(visited_slots.has(match.slot)).toBe(false);
            expect(visited_candidates.has(match.candidate)).toBe(false);
            visited_slots.add(match.slot);
            visited_candidates.add(match.candidate);
        });
        expect(Object.values(output5.interviews_per_interviewer).length).toBe(interviewers.length);
        visited_slots.clear();
        visited_candidates.clear();

        const output6 = match(candidates, interviewers, {
            interviewers_per_slot: 1,
            max_interviews_per_interviewer: 1,
        });
        expect(output6.matches.length).toBe(3);
        output6.matches.forEach((match) => {
            expect(match.interviewers.length).toBe(1);
            expect(visited_slots.has(match.slot)).toBe(false);
            expect(visited_candidates.has(match.candidate)).toBe(false);
            visited_slots.add(match.slot);
            visited_candidates.add(match.candidate);
        });
        expect(Object.values(output5.interviews_per_interviewer).length).toBe(interviewers.length);
    });

    it("should respect initial candidates and interviewers availability (medium size)", () => {
        const converted_data = convertDoodlesData(doodle_candidates_M, doodle_interviewers_M);
        const candidates_slots = mapIdToSlots(converted_data.candidates);
        const interviewers_slots = mapIdToSlots(converted_data.interviewers);
        expect(Object.entries(candidates_slots).length).toBe(10);
        expect(Object.entries(interviewers_slots).length).toBe(10);

        for (let i = 0; i < 5; ++i) {
            const visited_slots = new Set();
            const visited_candidates = new Set();
            const output = match(converted_data.candidates, converted_data.interviewers, {
                interviewers_per_slot: 2,
                max_interviews_per_interviewer: 1e5,
            });
            expect(output.matches.length).toBe(10);
            expect(Object.values(output.interviews_per_interviewer).length).toBe(10);
            output.matches.forEach((match) => {
                expect(match.interviewers.length).toBe(2);
                expect(visited_slots.has(match.slot)).toBe(false);
                expect(visited_candidates.has(match.candidate)).toBe(false);
                visited_slots.add(match.slot);
                visited_candidates.add(match.candidate);

                expect(candidates_slots[match.candidate].has(match.slot));
                expect(new Set([...match.interviewers]).size).toBe(match.interviewers.length);
                match.interviewers.forEach((interviewer) => {
                    --output.interviews_per_interviewer[interviewer];
                    expect(interviewers_slots[interviewer].has(match.slot));
                });
            });

            Object.values(output.interviews_per_interviewer).forEach((val) => {
                expect(val).toBe(0);
            });
        }
    });

    it("should respect initial candidates and interviewers availability (large size)", () => {
        const converted_data = convertDoodlesData(doodle_candidates_L, doodle_interviewers_L);
        const candidates_slots = mapIdToSlots(converted_data.candidates);
        const interviewers_slots = mapIdToSlots(converted_data.interviewers);
        expect(Object.entries(candidates_slots).length).toBe(30);
        expect(Object.entries(interviewers_slots).length).toBe(10);

        for (let i = 0; i < 5; ++i) {
            const visited_slots = new Set();
            const visited_candidates = new Set();
            const output = match(converted_data.candidates, converted_data.interviewers, {
                interviewers_per_slot: 2,
                max_interviews_per_interviewer: 1e5,
            });
            expect(output.matches.length).toBe(30);
            expect(Object.values(output.interviews_per_interviewer).length).toBe(10);
            output.matches.forEach((match) => {
                expect(match.interviewers.length).toBe(2);
                expect(visited_slots.has(match.slot)).toBe(false);
                expect(visited_candidates.has(match.candidate)).toBe(false);
                visited_slots.add(match.slot);
                visited_candidates.add(match.candidate);

                expect(candidates_slots[match.candidate].has(match.slot));
                expect(new Set([...match.interviewers]).size).toBe(match.interviewers.length);
                match.interviewers.forEach((interviewer) => {
                    --output.interviews_per_interviewer[interviewer];
                    expect(interviewers_slots[interviewer].has(match.slot));
                });
            });

            Object.values(output.interviews_per_interviewer).forEach((val) => {
                expect(val).toBe(0);
            });
        }
    });

    it("should respect initial candidates and interviewers availability (extra large size, 2 interviewers per slot)", () => {
        const converted_data = convertDoodlesData(doodle_candidates_XL, doodle_interviewers_XL);
        const candidates_slots = mapIdToSlots(converted_data.candidates);
        const interviewers_slots = mapIdToSlots(converted_data.interviewers);
        expect(Object.entries(candidates_slots).length).toBe(50);
        expect(Object.entries(interviewers_slots).length).toBe(20);

        for (let i = 0; i < 5; ++i) {
            const visited_slots = new Set();
            const visited_candidates = new Set();
            const output = match(converted_data.candidates, converted_data.interviewers, {
                interviewers_per_slot: 2,
                max_interviews_per_interviewer: 1e5,
            });
            expect(output.matches.length).toBe(50);
            expect(Object.values(output.interviews_per_interviewer).length).toBe(20);
            output.matches.forEach((match) => {
                expect(match.interviewers.length).toBe(2);
                expect(visited_slots.has(match.slot)).toBe(false);
                expect(visited_candidates.has(match.candidate)).toBe(false);
                visited_slots.add(match.slot);
                visited_candidates.add(match.candidate);

                expect(candidates_slots[match.candidate].has(match.slot));
                expect(new Set([...match.interviewers]).size).toBe(match.interviewers.length);
                match.interviewers.forEach((interviewer) => {
                    --output.interviews_per_interviewer[interviewer];
                    expect(interviewers_slots[interviewer].has(match.slot));
                });
            });

            Object.values(output.interviews_per_interviewer).forEach((val) => {
                expect(val).toBe(0);
            });
        }
    });

    it("should respect initial candidates and interviewers availability (extra large size, 3 interviewers per slot)", () => {
        const converted_data = convertDoodlesData(doodle_candidates_XL, doodle_interviewers_XL);
        const candidates_slots = mapIdToSlots(converted_data.candidates);
        const interviewers_slots = mapIdToSlots(converted_data.interviewers);
        expect(Object.entries(candidates_slots).length).toBe(50);
        expect(Object.entries(interviewers_slots).length).toBe(20);

        for (let i = 0; i < 5; ++i) {
            const visited_slots = new Set();
            const visited_candidates = new Set();
            const output = match(converted_data.candidates, converted_data.interviewers, {
                interviewers_per_slot: 3,
                max_interviews_per_interviewer: 1e5,
            });
            expect(output.matches.length).toBe(50);
            expect(Object.values(output.interviews_per_interviewer).length).toBe(20);
            output.matches.forEach((match) => {
                expect(match.interviewers.length).toBe(3);
                expect(visited_slots.has(match.slot)).toBe(false);
                expect(visited_candidates.has(match.candidate)).toBe(false);
                visited_slots.add(match.slot);
                visited_candidates.add(match.candidate);

                expect(candidates_slots[match.candidate].has(match.slot));
                expect(new Set([...match.interviewers]).size).toBe(match.interviewers.length);
                match.interviewers.forEach((interviewer) => {
                    --output.interviews_per_interviewer[interviewer];
                    expect(interviewers_slots[interviewer].has(match.slot));
                });
            });

            Object.values(output.interviews_per_interviewer).forEach((val) => {
                expect(val).toBe(0);
            });
        }
    });
});

describe("Verify if interviewer can attend slot", () => {
    const interviewers_slots = mapIdToSlots(interviewers);

    it("should return true if interviewer can attend slot", () => {
        ["slot 3", "slot 4"].forEach((slot) => {
            expect(canInterviewerAttendSlot("Interviewer A", slot, interviewers_slots)).toBe(true);
        });

        ["slot 1", "slot 2"].forEach((slot) => {
            expect(canInterviewerAttendSlot("Interviewer B", slot, interviewers_slots)).toBe(true);
        });

        ["slot 1", "slot 5"].forEach((slot) => {
            expect(canInterviewerAttendSlot("Interviewer C", slot, interviewers_slots)).toBe(true);
        });
    });

    it("should return false if interviewer can't attend slot", () => {
        ["slot 1", "slot 2", "slot 5"].forEach((slot) => {
            expect(canInterviewerAttendSlot("Interviewer A", slot, interviewers_slots)).toBe(false);
        });

        ["slot 3", "slot 4", "slot 5"].forEach((slot) => {
            expect(canInterviewerAttendSlot("Interviewer B", slot, interviewers_slots)).toBe(false);
        });

        ["slot 2", "slot 3", "slot 4"].forEach((slot) => {
            expect(canInterviewerAttendSlot("Interviewer C", slot, interviewers_slots)).toBe(false);
        });
    });
});

describe("Count total interviewers work in a match", () => {
    it("should return the correct toal work count", () => {
        const interviews_per_interviewer = {
            "A": 1,
            "B": 3,
            "C": 5,
            "D": 11,
        };

        expect(countInterviewersTotalWork(["A", "B"], interviews_per_interviewer)).toBe(4);
        expect(countInterviewersTotalWork(["A", "C"], interviews_per_interviewer)).toBe(6);
        expect(countInterviewersTotalWork(["A", "D"], interviews_per_interviewer)).toBe(12);
        expect(countInterviewersTotalWork(["B", "C"], interviews_per_interviewer)).toBe(8);
        expect(countInterviewersTotalWork(["B", "D"], interviews_per_interviewer)).toBe(14);
        expect(countInterviewersTotalWork(["C", "D"], interviews_per_interviewer)).toBe(16);
    });
});

describe("Convert participants list to map from participant id to participant slots", () => {
    it("should map participants ids to slots", () => {
        const participants_groups = [candidates, interviewers];

        participants_groups.forEach((participants) => {
            const participants_slots = mapIdToSlots(participants);

            participants.forEach((participant) => {
                expect(participants_slots[participant.id]).toBeDefined();
                expect(participants_slots[participant.id] instanceof Set).toBe(true);
                expect([...participants_slots[participant.id]].toString()).toBe(participant.slots.toString());
            });
        });
    });
});

describe("Convert participants list to map from slot to its participants", () => {
    it("should map slots to participants", () => {
        const participants_groups = [candidates, interviewers];

        participants_groups.forEach((participants) => {
            const slots_participants = mapSlotsToIds(participants);

            participants.forEach((participant) => {
                participant.slots.forEach((slot) => {
                    expect(slots_participants[slot]).toBeDefined();
                    expect(slots_participants[slot] instanceof Set).toBe(true);
                    expect(slots_participants[slot].has(participant.id)).toBe(true);
                });
            });
        });
    });
});

describe("Convert participants list to map from slot to its participants", () => {
    it("should map slots to participants", () => {
        const participants_groups = [candidates, interviewers];

        participants_groups.forEach((participants) => {
            const slots_participants = mapSlotsToIds(participants);

            participants.forEach((participant) => {
                participant.slots.forEach((slot) => {
                    expect(slots_participants[slot]).toBeDefined();
                    expect(slots_participants[slot] instanceof Set).toBe(true);
                    expect(slots_participants[slot].has(participant.id)).toBe(true);
                });
            });
        });
    });
});

describe("Iteratively improve given solution", () => {
    it("should not update a unique solution", () => {
        const matches = [
            {
                interviewers: ["I1"],
                slot: "S1",
                candidate: "C1",
            },
            {
                interviewers: ["I3"],
                slot: "S3",
                candidate: "C2",
            },
        ];
        const interviews_per_interviewer = {
            "I1": 1,
            "I2": 0,
            "I3": 1,
        };

        improveMatching(matches, interviews_per_interviewer, interviewers4, candidates4);

        expect(matches.length).toBe(2);
        expect(Object.entries(interviews_per_interviewer).length).toBe(3);
        matches.forEach((match) => {
            expect(match.interviewers.length).toBe(1);
        });
        expect(matches[0].interviewers[0]).toBe("I1");
        expect(matches[1].interviewers[0]).toBe("I3");
        expect(matches[0].slot).toBe("S1");
        expect(matches[1].slot).toBe("S3");
        expect(matches[0].candidate).toBe("C1");
        expect(matches[1].candidate).toBe("C2");
        expect(interviews_per_interviewer["I1"]).toBe(1);
        expect(interviews_per_interviewer["I2"]).toBe(0);
        expect(interviews_per_interviewer["I3"]).toBe(1);
    });

    it("should update a solution when there is room for improvement", () => {
        const matches = [
            {
                interviewers: ["I1"],
                slot: "S1",
                candidate: "C1",
            },
            {
                interviewers: ["I1"],
                slot: "S2",
                candidate: "C2",
            },
            {
                interviewers: ["I1"],
                slot: "S3",
                candidate: "C3",
            },
        ];
        const interviews_per_interviewer = {
            "I1": 3,
            "I2": 0,
            "I3": 0,
        };

        improveMatching(matches, interviews_per_interviewer, interviewers5, candidates5);

        expect(matches.length).toBe(3);
        expect(Object.entries(interviews_per_interviewer).length).toBe(3);
        matches.forEach((match) => {
            expect(match.interviewers.length).toBe(1);
        });
        expect(interviews_per_interviewer["I1"]).toBe(1);
        expect(interviews_per_interviewer["I2"]).toBe(1);
        expect(interviews_per_interviewer["I3"]).toBe(1);
    });

    it("should update a solution when there is room for improvement", () => {
        const matches = [
            {
                interviewers: ["I1", "I2"],
                slot: "S1",
                candidate: "C1",
            },
            {
                interviewers: ["I1", "I2"],
                slot: "S2",
                candidate: "C2",
            },
            {
                interviewers: ["I1", "I2"],
                slot: "S3",
                candidate: "C3",
            },
        ];
        const interviews_per_interviewer = {
            "I1": 3,
            "I2": 3,
            "I3": 0,
            "I4": 0,
            "I5": 0,
            "I6": 0,
        };

        improveMatching(matches, interviews_per_interviewer, interviewers6, candidates6);

        expect(matches.length).toBe(3);
        expect(Object.entries(interviews_per_interviewer).length).toBe(6);
        matches.forEach((match) => {
            expect(match.interviewers.length).toBe(2);
        });
        Object.values(interviews_per_interviewer).forEach((num_interviews) => {
            expect(num_interviews).toBe(1);
        });

        const found_interviewers = new Set();
        matches.forEach((match) => {
            match.interviewers.forEach((interviewer) => {
                expect(found_interviewers.has(interviewer)).toBe(false);
                found_interviewers.add(interviewer);
            });
        });
    });
});

describe("Swap slots between interviewers to improve current solution", () => {
    it("should not swap when there is no improvement obtained by swapping", () => {
        const matches = [
            {
                interviewers: ["I1"],
                slot: "S1",
                candidate: "C1",
            },
            {
                interviewers: ["I3"],
                slot: "S3",
                candidate: "C2",
            },
        ];
        const interviews_per_interviewer = {
            "I1": 1,
            "I2": 0,
            "I3": 1,
        };
        const interviewers_slots = mapIdToSlots(interviewers4);

        matches.forEach((match) => {
            interviewers4.forEach((interviewerA) => {
                interviewers4.forEach((interviewerB) => {
                    expect(
                        trySlotSwapBetweenInterviewers(interviewerA, interviewerB, match, interviews_per_interviewer, interviewers_slots),
                    ).toBe(false);
                });
            });
        });
        expect(matches.length).toBe(2);
        expect(Object.entries(interviews_per_interviewer).length).toBe(3);
        matches.forEach((match) => {
            expect(match.interviewers.length).toBe(1);
        });
        expect(matches[0].interviewers[0]).toBe("I1");
        expect(matches[1].interviewers[0]).toBe("I3");
        expect(matches[0].slot).toBe("S1");
        expect(matches[1].slot).toBe("S3");
        expect(matches[0].candidate).toBe("C1");
        expect(matches[1].candidate).toBe("C2");
        expect(interviews_per_interviewer["I1"]).toBe(1);
        expect(interviews_per_interviewer["I2"]).toBe(0);
        expect(interviews_per_interviewer["I3"]).toBe(1);
    });

    it("should swap when there is improvement obtained by swapping", () => {
        const matches = [
            {
                interviewers: ["I1"],
                slot: "S1",
                candidate: "C1",
            },
            {
                interviewers: ["I1"],
                slot: "S2",
                candidate: "C2",
            },
            {
                interviewers: ["I1"],
                slot: "S3",
                candidate: "C3",
            },
        ];
        const interviews_per_interviewer = {
            "I1": 3,
            "I2": 0,
            "I3": 0,
        };
        const interviewers_slots = mapIdToSlots(interviewers5);
        expect(
            trySlotSwapBetweenInterviewers("I3", "I1", matches[2], interviews_per_interviewer, interviewers_slots),
        ).toBe(true);

        expect(matches.length).toBe(3);
        expect(Object.entries(interviews_per_interviewer).length).toBe(3);
        matches.forEach((match) => {
            expect(match.interviewers.length).toBe(1);
        });

        expect(matches[0].interviewers[0]).toBe("I1");
        expect(matches[2].interviewers[0]).toBe("I3");
        expect(matches[0].slot).toBe("S1");
        expect(matches[2].slot).toBe("S3");
        expect(matches[0].candidate).toBe("C1");
        expect(matches[2].candidate).toBe("C3");
        expect(interviews_per_interviewer["I1"]).toBe(2);
        expect(interviews_per_interviewer["I2"]).toBe(0);
        expect(interviews_per_interviewer["I3"]).toBe(1);
    });
});

describe("Swap slots between interviewers to improve current solution", () => {
    it("should not swap when there is no improvement obtained by swapping", () => {
        const matches = [
            {
                interviewers: ["I1"],
                slot: "S1",
                candidate: "C1",
            },
            {
                interviewers: ["I3"],
                slot: "S3",
                candidate: "C2",
            },
        ];
        const interviews_per_interviewer = {
            "I1": 1,
            "I2": 0,
            "I3": 1,
        };
        const taken_slots = new Set(matches.map((match) => match.slot));
        const candidates_slots = mapIdToSlots(candidates4);
        const interviewers_slots = mapIdToSlots(interviewers4);
        const slots_interviewers = mapSlotsToIds(interviewers4);

        matches.forEach((match) => {
            interviewers4.forEach((interviewer) => {
                expect(
                    tryCandidateSlotSwap(
                        interviewer.id, match, interviews_per_interviewer, taken_slots, candidates_slots, interviewers_slots, slots_interviewers,
                    ),
                ).toBe(false);
            });
        });
        expect(matches.length).toBe(2);
        expect(Object.entries(interviews_per_interviewer).length).toBe(3);
        matches.forEach((match) => {
            expect(match.interviewers.length).toBe(1);
        });
        expect(matches[0].interviewers[0]).toBe("I1");
        expect(matches[1].interviewers[0]).toBe("I3");
        expect(matches[0].slot).toBe("S1");
        expect(matches[1].slot).toBe("S3");
        expect(matches[0].candidate).toBe("C1");
        expect(matches[1].candidate).toBe("C2");
        expect(interviews_per_interviewer["I1"]).toBe(1);
        expect(interviews_per_interviewer["I2"]).toBe(0);
        expect(interviews_per_interviewer["I3"]).toBe(1);
    });

    it("should swap when there is improvement obtained by swapping", () => {
        for (let i = 0; i < 10; ++i) {
            const matches = [
                {
                    interviewers: ["I1"],
                    slot: "S1",
                    candidate: "C1",
                },
                {
                    interviewers: ["I1"],
                    slot: "S2",
                    candidate: "C2",
                },
            ];
            const interviews_per_interviewer = {
                "I1": 2,
                "I2": 0,
            };
            const taken_slots = new Set(matches.map((match) => match.slot));
            const candidates_slots = mapIdToSlots(candidates7);
            const interviewers_slots = mapIdToSlots(interviewers7);
            const slots_interviewers = mapSlotsToIds(interviewers7);

            expect(
                tryCandidateSlotSwap(
                    "I2", matches[1], interviews_per_interviewer, taken_slots, candidates_slots, interviewers_slots, slots_interviewers,
                ),
            ).toBe(true);

            expect(matches.length).toBe(2);
            expect(Object.entries(interviews_per_interviewer).length).toBe(2);
            matches.forEach((match) => {
                expect(match.interviewers.length).toBe(1);
            });
            expect(matches[0].interviewers[0]).toBe("I1");
            expect(matches[1].interviewers[0]).toBe("I2");
            expect(matches[0].slot).toBe("S1");
            expect(matches[1].slot).toBe("S3");
            expect(matches[0].candidate).toBe("C1");
            expect(matches[1].candidate).toBe("C2");
            expect(interviews_per_interviewer["I1"]).toBe(1);
            expect(interviews_per_interviewer["I2"]).toBe(1);
        }
    });
});
