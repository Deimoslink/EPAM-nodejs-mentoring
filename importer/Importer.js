const {promisify} = require('util');
const fs = require('fs');
const csv = require('csvtojson');

const importPath = promisify(fs.readFile);

export default class Importer {

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
        console.log(path);
        csv()
            .fromFile(path)
            .then((jsonObj) => {
                callback(jsonObj);
            })
    }

}
