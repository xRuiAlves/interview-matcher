const FordFulkerson = require("./FordFulkerson/FordFulkerson");
const { hashEntity, dehashEntity } = require("./entities");
const { shuffleArray } = require("./utils");

const match = (candidates, interviewers, config) => {
    const slots = getSlots(candidates, interviewers);
    const { capacities, graph_nodes_map, graph_info } = buildCapacitiesGraph(candidates, interviewers, slots);
    populateCapacitiesGraph(candidates, interviewers, slots, capacities, graph_nodes_map, config);
    pruneCapacitiesGraph(interviewers, capacities, graph_nodes_map, config);

    const flows = new FordFulkerson(capacities, graph_info).calcMaxFlow();

    const output = buildMatchesFromFlows(flows, graph_nodes_map, graph_info, config);
    improveMatching(output.matches, output.interviews_per_interviewer, interviewers, candidates);

    return output;
};

const getSlots = (candidates, interviewers) => {
    const entry_groups = [candidates, interviewers];
    const slots = new Set();

    entry_groups.forEach((entry_group) => {
        entry_group.forEach((entry) => {
            entry.slots.forEach((slot) => slots.add(slot));
        });
    });

    return [...slots].sort();
};

const buildCapacitiesGraph = (candidates, interviewers, slots) => {
    const graph_nodes_map = {};
    const graph_info = {
        interviewers: new Set(),
        slot_filters: new Set(),
        slots: new Set(),
        candidates: new Set(),
    };

    // prepare flux matrix for ford fulkerson algorithm to compute interview matching

    // source node
    let offset = 0;
    graph_nodes_map["source"] = offset;

    // interviewer nodes
    offset += 1;
    interviewers.forEach((interviewer, i) => {
        graph_nodes_map[hashEntity("interviewer", interviewer.id)] = offset + i;
        graph_info.interviewers.add(offset + i);
    });

    // slot filter nodes
    offset += interviewers.length;
    slots.forEach((slot, i) => {
        graph_nodes_map[hashEntity("slot_filter", slot)] = offset + i;
        graph_info.slot_filters.add(offset + i);
    });

    // slot nodes
    offset += slots.length;
    slots.forEach((slot, i) => {
        graph_nodes_map[hashEntity("slot", slot)] = offset + i;
        graph_info.slots.add(offset + i);
    });

    // candidate nodes
    offset += slots.length;
    candidates.forEach((candidate, i) => {
        graph_nodes_map[hashEntity("candidate", candidate.id)] = offset + i;
        graph_info.candidates.add(offset + i);
    });

    // sink node
    offset += candidates.length;
    graph_nodes_map["sink"] = offset;

    const matrix_size = Object.keys(graph_nodes_map).length;

    const capacities = Array(matrix_size).fill().map(() => Array(matrix_size).fill(0));

    return {
        graph_nodes_map,
        capacities,
        graph_info,
    };
};

const populateCapacitiesGraph = (candidates, interviewers, slots, capacities, graph_nodes_map, config) => {
    // source to interviewers
    interviewers.forEach((interviewer) => {
        capacities[graph_nodes_map["source"]][graph_nodes_map[hashEntity("interviewer", interviewer.id)]] = config.max_interviews_per_interviewer;
    });

    // interviewers to slot filters
    interviewers.forEach((interviewer) => {
        interviewer.slots.forEach((slot) => {
            capacities[graph_nodes_map[hashEntity("interviewer", interviewer.id)]][graph_nodes_map[hashEntity("slot_filter", slot)]] = 1;
        });
    });

    // slots filters to slots and sink
    slots.forEach((slot) => {
        capacities[graph_nodes_map[hashEntity("slot_filter", slot)]][graph_nodes_map[hashEntity("slot", slot)]] = 1;
        capacities[graph_nodes_map[hashEntity("slot_filter", slot)]][graph_nodes_map["sink"]] = config.interviewers_per_slot - 1;
    });

    // slots to candidates
    candidates.forEach((candidate) => {
        candidate.slots.forEach((slot) => {
            capacities[graph_nodes_map[hashEntity("slot", slot)]][graph_nodes_map[hashEntity("candidate", candidate.id)]] = 1;
        });
    });

    // candidates to sink
    candidates.forEach((candidate) => {
        capacities[graph_nodes_map[hashEntity("candidate", candidate.id)]][graph_nodes_map["sink"]] = 1;
    });
};

const pruneCapacitiesGraph = (interviewers, capacities, graph_nodes_map, config) => {
    // remove edges to slots that can't have enough interviewers
    const num_interviewers_per_slot = {};

    interviewers.forEach((interviewer) => {
        interviewer.slots.forEach((slot) => {
            if (!num_interviewers_per_slot[slot]) {
                num_interviewers_per_slot[slot] = 0;
            }
            ++num_interviewers_per_slot[slot];
        });
    });

    for (const [slot, count] of Object.entries(num_interviewers_per_slot)) {
        if (count < config.interviewers_per_slot) {
            // not enough interviewers available to make this slot work; prune edge from tree
            const slot_node_id = graph_nodes_map[hashEntity("slot_filter", slot)];
            for (let i = 0; i < capacities.length; ++i) {
                capacities[i][slot_node_id] = 0;
            }
        }
    }
};

const buildMatchesFromFlows = (flows, graph_nodes_map, graph_info, config) => {
    const sink_node = flows.length - 1;

    const graph_reverse_nodes_map = {};
    Object.entries(graph_nodes_map).forEach(([node_name, node_id]) => {
        graph_reverse_nodes_map[node_id] = node_name;
    });

    // compute slots that have a candidate and the required number of interviewers
    const complete_slots = [...graph_info.slot_filters].filter((slot_filter) => {
        const slot = slot_filter + graph_info.slot_filters.size;
        return flows[slot_filter][sink_node] + flows[slot_filter][slot] === config.interviewers_per_slot;
    });

    // build slots output schema
    const interviews_per_interviewer = {};
    const matches = {};
    complete_slots.forEach((slot_filter_id) => {
        matches[slot_filter_id] = {
            slot: dehashEntity("slot_filter", graph_reverse_nodes_map[slot_filter_id]),
            interviewers: [],
            candidate: null,
        };
    });

    // find the assigned candidate for each slot
    complete_slots.forEach((slot_filter_id) => {
        const slot_id = slot_filter_id + graph_info.slot_filters.size;
        for (const candidate_id of graph_info.candidates) {
            if (flows[slot_id][candidate_id] === 1) {
                matches[slot_filter_id].candidate = dehashEntity("candidate", graph_reverse_nodes_map[candidate_id]);
            }
        }
    });

    // find the interviewers assigned to each slot
    graph_info.interviewers.forEach((interviewer_id) => {
        interviews_per_interviewer[dehashEntity("interviewer", graph_reverse_nodes_map[interviewer_id])] = 0;
        complete_slots.forEach((slot_filter_id) => {
            if (flows[interviewer_id][slot_filter_id] === 1) {
                const interviewer_name = dehashEntity("interviewer", graph_reverse_nodes_map[interviewer_id]);
                matches[slot_filter_id].interviewers.push(interviewer_name);
                ++interviews_per_interviewer[interviewer_name];
            }
        });
    });

    return {
        matches: Object.values(matches).sort((match1, match2) => match1.candidate.localeCompare(match2.candidate)),
        interviews_per_interviewer,
    };
};

const improveMatching = (matches, interviews_per_interviewer, interviewers, candidates) => {
    const NUM_IMPROVEMENTS_ITERATIONS = 20;
    const taken_slots = new Set(matches.map((match) => match.slot));

    const candidates_slots = mapIdToSlots(candidates);
    const interviewers_slots = mapIdToSlots(interviewers);
    const slots_interviewers = mapSlotsToIds(interviewers);

    for (let i = 0; i < NUM_IMPROVEMENTS_ITERATIONS; ++i) {
        let improvement = false;

        const sorted_interviewers = Object.entries(interviews_per_interviewer)
            .sort(([_name1, count1], [_name2, count2]) => count1 - count2)
            .map(([name, _count]) => name);

        sorted_interviewers.forEach((interviewer) => {
            matches.forEach((match) => {
                if (!match.interviewers.includes(interviewer)) {
                    if (tryCandidateSlotSwap(
                        interviewer, match, interviews_per_interviewer, taken_slots, candidates_slots, interviewers_slots, slots_interviewers,
                    )) {
                        improvement = true;
                    }

                    match.interviewers.forEach((other_interviewer) => {
                        if (trySlotSwapBetweenInterviewers(interviewer, other_interviewer, match, interviews_per_interviewer, interviewers_slots)) {
                            improvement = true;
                        }
                    });
                }
            });
        });

        if (!improvement) {
            break;
        }
    }
};

const trySlotSwapBetweenInterviewers = (interviewerA, interviewerB, match, interviews_per_interviewer, interviewers_slots) => {
    if (interviewerA !== interviewerB
        && interviews_per_interviewer[interviewerA] < interviews_per_interviewer[interviewerB]
        && !match.interviewers.includes(interviewerA)
    ) {
        if (canInterviewerAttendSlot(interviewerA, match.slot, interviewers_slots)) {
            for (let i = 0; i < match.interviewers.length; ++i) {
                if (match.interviewers[i] === interviewerB) {
                    match.interviewers[i] = interviewerA;

                    --interviews_per_interviewer[interviewerB];
                    ++interviews_per_interviewer[interviewerA];

                    return true;
                }
            }

            return false;
        }

        return false;
    }

    return false;
};

const canInterviewerAttendSlot = (interviewer_id, slot, interviewers_slots) => interviewers_slots[interviewer_id].has(slot);

const tryCandidateSlotSwap = (interviewer, match, interviews_per_interviewer, taken_slots, candidates_slots, interviewers_slots, slots_interviewers) => {
    const curr_interviewers_work = countInterviewersTotalWork(match.interviewers, interviews_per_interviewer);
    const interviewers_per_slot = match.interviewers.length;

    for (const slot of candidates_slots[match.candidate]) {
        if (!taken_slots.has(slot)
            && canInterviewerAttendSlot(interviewer, slot, interviewers_slots)
            && slots_interviewers[slot].size >= interviewers_per_slot
        ) {
            const valid_interviewers = new Set([...slots_interviewers[slot]]);
            valid_interviewers.delete(interviewer);

            const new_interviewers = [interviewer].concat(shuffleArray([...valid_interviewers])).slice(0, interviewers_per_slot);
            const new_interviewers_work = countInterviewersTotalWork(new_interviewers, interviews_per_interviewer);

            if (new_interviewers_work + interviewers_per_slot < curr_interviewers_work) {
                taken_slots.delete(match.slot);
                taken_slots.add(slot);
                match.slot = slot;

                match.interviewers.forEach((old_interviewer) => {
                    --interviews_per_interviewer[old_interviewer];
                });
                new_interviewers.forEach((new_interviewer) => {
                    ++interviews_per_interviewer[new_interviewer];
                });
                match.interviewers = new_interviewers;

                return true;
            }
        }
    }

    return false;
};

const countInterviewersTotalWork = (interviewers, interviews_per_interviewer) => (
    interviewers.reduce((work, interviewer) => work + interviews_per_interviewer[interviewer], 0)
);

const mapIdToSlots = (participants) => {
    const participants_slots = {};
    participants.forEach((participant) => {
        participants_slots[participant.id] = new Set(participant.slots);
    });
    return participants_slots;
};

const mapSlotsToIds = (participants) => {
    const slots_participants = {};
    participants.forEach((participant) => {
        participant.slots.forEach((slot) => {
            if (!slots_participants[slot]) {
                slots_participants[slot] = new Set();
            }
            slots_participants[slot].add(participant.id);
        });
    });
    return slots_participants;
};

module.exports = {
    match,
    getSlots,
    buildCapacitiesGraph,
    populateCapacitiesGraph,
    pruneCapacitiesGraph,
    buildMatchesFromFlows,
    canInterviewerAttendSlot,
    countInterviewersTotalWork,
    mapIdToSlots,
    mapSlotsToIds,
    improveMatching,
    trySlotSwapBetweenInterviewers,
    tryCandidateSlotSwap,
};
