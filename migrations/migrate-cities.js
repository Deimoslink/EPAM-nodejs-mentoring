import {cities} from '../data/cities';
import * as CONFIG from  '../config/app.config';
import {citySchema} from '../schemas/city-mongoose-schema';
const mongoose = require('mongoose');
const conStr = CONFIG.connections.mongoose;

mongoose.connect(conStr);

const City = mongoose.model('City', citySchema);

const transformCities = (cities) => {
    return cities.map(city => ({
        name: city.name,
        country: city.country,
        location: {
            lat: parseFloat(city.lat),
            lon: parseFloat(city.lon)
        }
    }))
};

City.collection.insertMany(transformCities(cities), () => {
    mongoose.disconnect();
});
