const {promisify} = require('util');
const fs = require('fs');
const csv = require('csvtojson');

const importPath = promisify(fs.readFile);

class Importer {

    constructor() {}

    read(path, callback) {
        importPath(path).then(
            data => {
                callback(data.toString());
            },
            err => console.log(err)
        );
    }

    readCSV(path, callback) {
        csv()
            .fromFile(path)
            .then((jsonObj) => {
                callback(jsonObj);
            })
    }

}

module.exports = Importer;