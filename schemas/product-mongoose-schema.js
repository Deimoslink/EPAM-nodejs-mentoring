const mongoose = require('mongoose');

export const productSchema = mongoose.Schema({
    name: String,
    country: String,
    description: String,
    lastModifiedDate: String
});
