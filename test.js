const Database = require('./index.js');

db = new Database('./db.sqlite');

db.prepare('SELECT * FROM QUESTION LIMIT ?')
    .then(statement => statement.all(2).then(rows => console.log(rows)))