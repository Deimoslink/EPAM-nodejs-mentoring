import DirWatcher from './dirwatcher/DirWatcher'
import Importer from './importer/Importer'
import {default as config} from './config/config.json';

const dirWatcher = new DirWatcher();
const importer = new Importer();

dirWatcher.on('changed', (path) => {
    importer.readCSV(path, (data) => {
        console.log(`${path} contents:`);
        console.log(data);
    });
});

dirWatcher.watch('./data', 1000);

