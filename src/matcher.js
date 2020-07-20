const match = (candidates, interviewers, config) => {
    const slots = getSlots(candidates, interviewers);
    const { capacities, graph_entities_map } = buildMatchesMatrix(candidates, interviewers, slots);
    populateCapacitiesGraph(candidates, interviewers, slots, capacities, graph_entities_map, config);
    return "TO DO";
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

const buildMatchesMatrix = (candidates, interviewers, slots) => {
    const graph_entities_map = {};

    // prepare flux matrix for ford fulkerson algorithm to compute interview matching

    // source node
    let offset = 0;
    graph_entities_map["source"] = offset;

    // interviewer nodes
    offset += 1;
    interviewers.forEach((interviewer, i) => {
        graph_entities_map[`interviewer_${interviewer.id}`] = offset + i;
    });

    // slot filter nodes
    offset += interviewers.length;
    slots.forEach((slot, i) => {
        graph_entities_map[`slot_filter_${slot}`] = offset + i;
    });

    // slot nodes
    offset += slots.length;
    slots.forEach((slot, i) => {
        graph_entities_map[`slot_${slot}`] = offset + i;
    });

    // candidate nodes
    offset += slots.length;
    candidates.forEach((candidate, i) => {
        graph_entities_map[`candidate_${candidate.id}`] = offset + i;
    });

    // sink node
    offset += candidates.length;
    graph_entities_map["sink"] = offset;

    const matrix_size = Object.keys(graph_entities_map).length;

    const capacities = Array(matrix_size).fill().map(() => Array(matrix_size).fill(0));

    return {
        graph_entities_map,
        capacities,
    };
};

const populateCapacitiesGraph = (candidates, interviewers, slots, capacities, graph_entities_map, config) => {
    // source to interviewers
    interviewers.forEach((interviewer) => {
        capacities[graph_entities_map["source"]][graph_entities_map[`interviewer_${interviewer.id}`]] = config.max_interviews_per_interviewer;
    });

    // interviewers to slot filters
    interviewers.forEach((interviewer) => {
        interviewer.slots.forEach((slot) => {
            capacities[graph_entities_map[`interviewer_${interviewer.id}`]][graph_entities_map[`slot_filter_${slot}`]] = 1;
        });
    });

    // slots filters to slots and sink
    slots.forEach((slot) => {
        capacities[graph_entities_map[`slot_filter_${slot}`]][graph_entities_map[`slot_${slot}`]] = 1;
        capacities[graph_entities_map[`slot_filter_${slot}`]][graph_entities_map["sink"]] = config.interviewers_per_slot - 1;
    });

    // slots to candidates
    candidates.forEach((candidate) => {
        candidate.slots.forEach((slot) => {
            capacities[graph_entities_map[`slot_${slot}`]][graph_entities_map[`candidate_${candidate.id}`]] = 1;
        });
    });

    // candidates to sink
    candidates.forEach((candidate) => {
        capacities[graph_entities_map[`candidate_${candidate.id}`]][graph_entities_map["sink"]] = 1;
    });
};

module.exports = {
    match,
    getSlots,
    buildMatchesMatrix,
    populateCapacitiesGraph,
};
