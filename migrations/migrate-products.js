import {products} from '../data/products';
import * as CONFIG from  '../config/app.config';
const mongoose = require('mongoose');
const conStr = CONFIG.connections.mongoose;

mongoose.connect(conStr);

const productSchema = mongoose.Schema({
    name: String,
    country: String,
    description: String
});

const Product = mongoose.model('Product', productSchema);

Product.collection.insertMany(products, () => {
    mongoose.disconnect();
});
