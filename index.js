const sqlite3 = require('sqlite3');

class Sqlite3Promise {
    static get OPEN_READONLY() {
        return sqlite3.OPEN_READONLY;
    }

    static get OPEN_READWRITE() {
        return sqlite3.OPEN_READWRITE;
    }

    static get OPEN_CREATE() {
        return sqlite3.OPEN_CREATE;
    }

    static verbose() {
        return sqlite3.verbose();
    }

    constructor(filename, mode, cb) {
        let defMode = Sqlite3Promise.OPEN_READWRITE | Sqlite3Promise.OPEN_CREATE;
        let defCb = () => {};

        if (typeof mode === 'function') {
            defCb = mode;
        } else if (typeof mode !== 'undefined') {
            defMode = mode;
        }

        if (typeof cb !== 'undefined') {
            defCb = cb;
        }

        this._db = new sqlite3.Database(filename, defMode, () => {
            defCb();
        });
    }
}

module.exports = Sqlite3Promise;