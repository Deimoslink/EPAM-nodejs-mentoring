const program = require('commander');
const Importer = require('../importer/Importer');
const fs = require('fs');
const {promisify} = require('util');
const os = require('os');

const readdirAsync = promisify(fs.readdir);
const readfileAsync = promisify(fs.readFile);
const importer = new Importer();

const echo = () => {
    console.log('Give me a string to echo');
    process.stdin.on('readable', () => {
        const str = process.stdin.read();
        if (str) {
            process.stdout.write(`echoes: ${str}`);
            process.stdin.end();
        }
    });
};

const reverse = () => {
    console.log('Give me a string to reverse');
    process.stdin.on('readable', () => {
        const str = process.stdin.read();
        if (str) {
            process.stdout.write(Array.from(str).reverse().join(''));
            process.stdin.end();
        }
    });
};

const transform = () => {
    console.log('Give me a string to transform');
    process.stdin.on('readable', () => {
        const str = process.stdin.read();
        if (str) {
            console.log(str.toString());
            process.stdout.write(str.toString().toUpperCase());
            process.stdin.end();
        }
    });
};

const readFile = (path) => {
  importer.read(path, (content) => {
     console.log(content);
  });
};

const convertToJSON = (path) => {
    importer.readCSV(path, (content) => {
        const filename = path.slice(0, path.lastIndexOf('.'));
        fs.writeFile(filename + '.json', JSON.stringify(content), (err) => {
            if (err) throw err;
            console.log(filename + '.json file saved');
        });
    });
};

const readFileCSV = (path) => {
    importer.readCSV(path, (content) => {
        console.log(content);
    });
};

const bundleCSS = (dir) => {
    readdirAsync(dir).then(
        files => {
            files = files.filter(fileName => {return /\.css$/i.test(fileName) && fileName !== 'bundle.css'});
            console.log(dir, files, os.EOL);
            Promise.all(files.map(file => readfileAsync(`${dir}/${file}`))).then(content => {
                const result = content.reduce((result, value) => {
                    return result + os.EOL + value;
                });
                fs.writeFile(dir + '/bundle.css', result + os.EOL, (err) => {
                    if (err) throw err;
                    console.log('bundle.css saved');
                });
            });
        }
    );
};

const actions = {
    echo: echo,
    reverse: reverse,
    transform: transform,
    readFile: readFile,
    readFileCSV: readFileCSV,
    convertToJSON: convertToJSON,
    bundleCSS: bundleCSS
};

process.stdin.setEncoding('utf8');

program
    .option('-a, --actionName <a>', 'Set action', /^(echo|reverse|transform|readFile|readFileCSV|convertToJSON|bundleCSS)$/i)
    .option('-f, --file [f]', 'Set filename')
    .option('-p, --path [p]', 'Set directory with css files')
    .parse(process.argv);

if (program.actionName) {
    const actionName = program.actionName;
    if (actionName === 'bundleCSS') {
        if (program.path) {
            actions[actionName](program.path);
        } else {
            console.log('Path should be set');
            console.log('Choose any of these actions: echo, reverse, transform, readFile, readFileCSV, convertToJSON, bundleCSS');
            program.help();
        }
    } else {
        if (actions[actionName]) {
            if (program.file) {
                actions[actionName](program.file);
            } else {
                actions[actionName]();
            }
        } else {
            console.log('Invalid action');
            console.log('Choose any of these actions: echo, reverse, transform, readFile, readFileCSV, convertToJSON, bundleCSS');
            program.help();
        }
    }

}
