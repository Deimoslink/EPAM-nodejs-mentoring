const {promisify} = require('util');
const fs = require('fs');
const EventEmitter = require('events');
const crypto = require('crypto');

const readdirAsync = promisify(fs.readdir);

export default class DirWatcher extends EventEmitter {

    _getHash(filePath, callback) {
        const md5sum = crypto.createHash('md5');
        var stream = fs.ReadStream(filePath);

        stream.on('data', function(data) {
            md5sum.update(data);
        });

        stream.on('end', function() {
            callback(md5sum.digest('hex'));
        });
    }

    _getFilePath(dir, fileName) {
        return `${dir}/${fileName}`;
    }

    _arrToMap(arr) {
        let obj = {};
        arr.map(el => {
            obj[el] = true;
        });
        return obj;
    }

    _logOutFileNames(oldArr, newArr) {
        oldArr.sort();
        newArr.sort();
        if (newArr.length < oldArr.length) {
            let newArrMap = this._arrToMap(newArr);
            let fileName = oldArr.filter(el => {
                return !newArrMap[el]
            });
            console.log(`removed: ${fileName}`);
        }
        if (newArr.length > oldArr.length) {
            let oldArrMap = this._arrToMap(oldArr);
            let fileName = newArr.filter(el => {
                return !oldArrMap[el]
            });
            console.log(`added: ${fileName}`);
        }
        if (newArr.length === oldArr.length) {
            let index = oldArr.findIndex((el, index) => {
                return el !== newArr[index];
            });
            console.log(`${oldArr[index]} 'was renamed to' ${newArr[index]}`);
        }
    }

    watch(dir, delay) {
        let fileNames = [];
        let firstRun = true;
        let dirHash;
        let fileHashes = [];
        console.log(`stared watching ${dir}`);

        setInterval(() => {
            readdirAsync(dir).then(
                files => {
                    const arraySum = crypto.createHash('md5');
                    arraySum.update(files.toString());
                    const newHash = arraySum.digest('hex');
                    if (dirHash !== newHash) {
                        dirHash = newHash;
                        if (!firstRun) {
                            console.log('directory was updated');
                            this._logOutFileNames(fileNames, files);
                            fileNames = files;
                            fileHashes = [];
                            files.map(fileName => {
                                this._getHash(this._getFilePath(dir, fileName), hash => {
                                    fileHashes.push(hash);
                                });
                            });
                        }
                    } else if (!firstRun) {
                        files.map((fileName, index) => {
                            const path = this._getFilePath(dir, fileName);
                            this._getHash(path, hash => {
                                if (fileHashes[index] !== hash) {
                                    fileHashes[index] = hash;
                                    console.log(`file ${path} was updated`);
                                    this.emit('changed', path);
                                }
                            });
                        });
                    }
                    if (firstRun) {
                        fileNames = files;
                        files.map((fileName, index) => {
                            const path = this._getFilePath(dir, fileName);
                            this._getHash(path, hash => {
                                if (fileHashes[index] !== hash) {
                                    fileHashes[index] = hash;
                                    console.log(`found ${path}`);
                                    this.emit('changed', path);
                                }
                            });
                        });
                    }
                    firstRun = false;
                },
                err => console.log(err)
            )
        }, delay);

    }

}
