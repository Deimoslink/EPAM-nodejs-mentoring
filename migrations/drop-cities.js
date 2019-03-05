import * as CONFIG from  '../config/app.config';
import {citySchema} from '../schemas/city-mongoose-schema';
const mongoose = require('mongoose');
const conStr = CONFIG.connections.mongoose;

mongoose.connect(conStr);

const City = mongoose.model('City', citySchema);

City.collection.drop(() => {
    mongoose.disconnect();
});
