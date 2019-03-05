import {Schema} from 'mongoose';
const mongoose = require('mongoose');

const coordinatesSchema = new Schema({
    lat: {
        type: Number,
        required: true,
        min: -90,
        max: 90
    },
    lon: {
        type: Number,
        required: true,
        min: -180,
        max: 180
    },
});

export const citySchema = mongoose.Schema({
    name: String,
    country: String,
    location: coordinatesSchema,
    lastModifiedDate: String
});
