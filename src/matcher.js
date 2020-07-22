const FordFulkerson = require("./FordFulkerson/FordFulkerson");
const { hashEntity, dehashEntity } = require("./entities");

const match = (candidates, interviewers, config) => {
    const slots = getSlots(candidates, interviewers);
    const { capacities, graph_nodes_map, graph_info } = buildCapacitiesGraph(candidates, interviewers, slots);
    populateCapacitiesGraph(candidates, interviewers, slots, capacities, graph_nodes_map, config);
    pruneCapacitiesGraph(interviewers, capacities, graph_nodes_map, config);

    const flows = new FordFulkerson(capacities, graph_info).calcMaxFlow();

    return buildMatchesFromFlows(flows, graph_nodes_map, graph_info, config);
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
        complete_slots.forEach((slot_filter_id) => {
            if (flows[interviewer_id][slot_filter_id] === 1) {
                matches[slot_filter_id].interviewers.push(dehashEntity("interviewer", graph_reverse_nodes_map[interviewer_id]));
            }
        });
    });

    return Object.values(matches);
};

module.exports = {
    match,
    getSlots,
    buildCapacitiesGraph,
    populateCapacitiesGraph,
    pruneCapacitiesGraph,
    buildMatchesFromFlows,
};
