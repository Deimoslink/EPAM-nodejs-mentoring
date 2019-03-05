import * as CONFIG from  '../config/app.config';
import {productSchema} from '../schemas/product-mongoose-schema';
const mongoose = require('mongoose');
const conStr = CONFIG.connections.mongoose;

mongoose.connect(conStr);

const Product = mongoose.model('Product', productSchema);

Product.collection.drop(() => {
    mongoose.disconnect();
});
