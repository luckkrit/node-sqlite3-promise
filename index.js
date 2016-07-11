const sqlite3 = require('sqlite3');

function promisate(method, ...param) {
    return new Promise((resolve, reject) => method(...param, (err, ...result) => err === null || err === undefined ? resolve(...result) : reject(err)));
}

class Statement {
    constructor(db, sql, ...param) {
        this._statement = new Promise((resolve, reject) => {
            const statement = db.prepare(sql, ...param, err => err === null ? resolve(statement) : reject(err))
        });
    }

    bind(...param) {
        return this._statement.then(statement => promisate(statement.bind.bind(statement), ...param));
    }

    reset() {
        return this._statement.then(statement => promisate(statement.reset.bind(statement)));
    }

    finalize() {
        return this._statement.then(statement => promisate(statement.finalize.bind(statement)));
    }

    run(...param) {
        return this._statement.then(statement => new Promise((resolve, reject) => statement.run(...param, function(err) { err === null ? resolve(this) : reject(err) })));
    }

    get(...param) {
        return this._statement.then(statement => promisate(statement.get.bind(statement), ...param));
    }

    all(...param) {
        return this._statement.then(statement => promisate(statement.all.bind(statement), ...param));
    }
}

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

    constructor(filename, mode = Sqlite3Promise.OPEN_CREATE | Sqlite3Promise.OPEN_READWRITE, cached = false) {
        this._db = new Promise((resolve, reject) => {
            const db = cached ? 
                new sqlite3.cached.Database(filename, mode, err => err === null ? resolve(db) : reject(err)) :
                new sqlite3.Database(filename, mode, err => err === null ? resolve(db) : reject(err));
        });
    }

    close() {
        return this._db.then(db => promisate(db.close.bind(db)));
    }

    run(sql, ...param) {
        return this._db.then(db => new Promise((resolve, reject) => db.run(sql, ...param, function(err){ err === null ? resolve(this) : reject(err)})));
    }

    get(sql, ...param) {
        return this._db.then(db => promisate(db.get.bind(db), sql, ...param));
    }

    all(sql, ...param) {
        return this._db.then(db => promisate(db.all.bind(db), sql, ...param));
    }

    exec(sql) {
        return this._db.then(db => promisate(db.exec.bind(db), sql, ...param));
    }

    prepare(sql, ...param) {
        return this._db.then(db => new Statement(db, sql, ...param));
    }

    serialize() {
        return this._db.then(db => promisate(db.serialize.bind(db)));
    }

    parallelize() {
        return this._db.then(db => promisate(db.parallelize.bind(db)));
    }
}

module.exports = Sqlite3Promise;