const HOL = 0;
const BAL = 1;
const FLT = 2;

const emptyBoard = [
    new Uint8Array([FLT, FLT, HOL, HOL, HOL, FLT, FLT]),
    new Uint8Array([FLT, FLT, HOL, HOL, HOL, FLT, FLT]),
    new Uint8Array([HOL, HOL, HOL, HOL, HOL, HOL, HOL]),
    new Uint8Array([HOL, HOL, HOL, HOL, HOL, HOL, HOL]),
    new Uint8Array([HOL, HOL, HOL, HOL, HOL, HOL, HOL]),
    new Uint8Array([FLT, FLT, HOL, HOL, HOL, FLT, FLT]),
    new Uint8Array([FLT, FLT, HOL, HOL, HOL, FLT, FLT]),
]

class Configuration {
    constructor() {
        // this.spaces = 
    }

    codeToSpaces(code) {
        const spaces = [];
        for (let i = 0; i < 7; i++) {
            spaces[i] = new Uint8Array(7);
        }
    }
}

module.exports = Configuration;
