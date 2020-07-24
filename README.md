# Interview Matcher

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Build Status](https://circleci.com/gh/xRuiAlves/interview-matcher.svg?style=shield)](https://circleci.com/gh/xRuiAlves/interview-matcher) [![Coverage Status](https://coveralls.io/repos/github/xRuiAlves/interview-matcher/badge.svg?branch=master)](https://coveralls.io/github/xRuiAlves/interview-matcher?branch=master) [![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2FxRuiAlves%2Finterview-matcher%2Fmaster)](https://dashboard.stryker-mutator.io/reports/github.com/xRuiAlves/interview-matcher/master)

Interview slots matcher for candidates and interviewers, built using NodeJS.

## Features

- Match interviewers and candidates in interview slots, according to both parties' availability
- Integration with [Doodle polls](https://doodle.com/)

## Installing

Using npm:

```
$ npm install interview-matcher
```

## Usage

```
$ interview-matcher <input_type> <candidates> <interviewers> <output_file> [<interviewers_per_slot>]
```

- `input_type`: candidate and interviewer options input data type
    - `--json` for JSON files (format described below)
    - `--doodle` for Doodle poll IDs
- `candidates`: candidates options
- `interviewers`: interviewers options
- `output_file`: output file name
- `interviewers_per_slot` (defaults to 1): required number of interviewers per slot

Note that for *Doodle poll* usage, both polls must feature the same option slots schema.

### Example

```
$ interview-matcher --json candidates.json interviewers.json output.json 3
```

```
$ interview-matcher --doodle vd5nppeyrzpxvy2w vbzps7w629a679k3 output.json 2
```

## JSON input files format

The JSON input files should follow the following format:

```javascript
[
    {
        "name": "Name 1",   // candidate/interviewer name (must be unique)
        "slots": [
            "slot 1",       // list of all the slots the candidate/interviewer
            "slot 2",       // has availability to attend
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

## JSON output files format

The JSON output files follow the following format:

### Given JSON input

```javascript
{
    "matches": [
        {
            "slot": "slot 1",
            "interviewers": [
                "Interviewer 1",
                "Interviewer 2",
                "Interviewer N"
            ],
            "candidate": "Candidate 1"
        },
        {
            "slot": "slot 2",
            "interviewers": [
                "Interviewer 1",
                "Interviewer 2",
                "Interviewer N"
            ],
            "candidate": "Candidate B"
        },
        {
            "slot": "slot N",
            "interviewers": [
                "Interviewer 1",
                "Interviewer 2",
                "Interviewer N"
            ],
            "candidate": "Candidate N"
        }
    ],
    "interviews_per_interviewer": {
        "Interviewer 1": X,
        "Interviewer 2": Y,
        "Interviewer 3": Z
    }
}
```

### Given Doodle input

```javascript
{
    "matches": [
        {
            "slot": {
                "start": "UTC Start Date 1",
                "end": "UTC Start End 1"
            },
            "candidate": {
                "name": "Candidate 1",
                "id": "Candidate ID 1"
            },
            "interviewers": [
                {
                    "name": "Interviewer 1",
                    "id": "Interview ID 1"
                },
                {
                    "name": "Interviewer N",
                    "id": "Interview ID N"
                }
            ]
        },
        {
            "slot": {
                "start": "UTC Start Date 2",
                "end": "UTC Start End 2"
            },
            "candidate": {
                "name": "Candidate 2",
                "id": "Candidate ID 2"
            },
            "interviewers": [
                {
                    "name": "Interviewer 1",
                    "id": "Interview ID 1"
                },
                {
                    "name": "Interviewer N",
                    "id": "Interview ID N"
                }
            ]
        },
        {
            "slot": {
                "start": "UTC Start Date N",
                "end": "UTC Start End N"
            },
            "candidate": {
                "name": "Candidate N",
                "id": "Candidate ID N"
            },
            "interviewers": [
                {
                    "name": "Interviewer 1",
                    "id": "Interview ID 1"
                },
                {
                    "name": "Interviewer N",
                    "id": "Interview ID N"
                }
            ]
        }
    ],
    "interviews_per_interviewer": {
        "Interviewer 1": X,
        "Interviewer 2": Y,
        "Interviewer 3": Z
    }
}
```

## Tests

To run the test suite, install the project's dependencies and run `npm test`:

```
$ npm install
$ npm test
```

To run mutation tests:

```
$ npm run test:mutation
```

## License

[MIT](https://github.com/xRuiAlves/interview-matcher/blob/master/LICENSE)
