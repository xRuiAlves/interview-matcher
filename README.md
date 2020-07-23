# Interview Matcher

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Known Vulnerabilities](https://snyk.io/test/github/xRuiAlves/interview-matcher/badge.svg)](https://snyk.io/test/github/{username}/{repo}) [![Coverage Status](https://coveralls.io/repos/github/xRuiAlves/interview-matcher/badge.svg?branch=master)](https://coveralls.io/github/xRuiAlves/interview-matcher?branch=master) [![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2FxRuiAlves%2Finterview-matcher%2Fmaster)](https://dashboard.stryker-mutator.io/reports/github.com/xRuiAlves/interview-matcher/master)

Interview slots matcher for candidates and interviewers, built using NodeJS.

## Setup and Development

Install all project dependencies:

```
npm i
```

To run the app, use `npm start`:

```
npm start <input_type> <candidates> <interviewers> <output_file> <interviewers_per_slot> [<max_interviews_per_interviewer>]
```

- `input_type`: candidate and interviewer options input data type (may be a JSON file, format detailed below or a Doodle poll)
    - `--json` for JSON files
    - `--doodle` for Doodle poll IDs
- `candidates`: candidates options
- `interviewers`: interviewers options
- `output_file`: output file name
- `interviewers_per_slot`: required number of interviewers per slot
- `max_interviews_per_interviewer`, *optional*: maximum number of interviews that a interviewer may be assigned to

### JSON input files format

The JSON input files should follow the following format:

```javascript
[
    {
        "name": "Name 1",   // candidate/interviewer name (must be unique)
        "slots": [          // list of all the slots the candidate/interviewer has availability to attend
            "slot 1",
            "slot 2",
            "slot N"
        ]
    },
    {
        "name": "Name 2",
        "slots": [
            "slot 1",
            "slot 2",
            "slot N"
        ]
    },
    {
        "name": "Name N",
        "slots": [
            "slot 1",
            "slot 2",
            "slot N"
        ]
    }
]
```

### Testing

To run the tests, use:

```
npm test
```

To run mutations tests, use:

```
npm run test:mutation
```

### Auditing and Linting

To audit the app for vulnerabilities, use:

```
npm audit
```

To lint the source files, use:

```
npm run lint
```
