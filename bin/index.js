#!/usr/bin/env node
const { main } = require("../src/main");
const { printError } = require("../src/printer");

try {
    main().catch((e) => {
        printError(e.err, e.msg);
        process.exit(e.err.code);
    });
} catch (e) {
    printError(e.err, e.msg);
    process.exit(e.err.code);
}
