import {users} from '../data/users';
import * as CONFIG from  '../config/app.config';
const mongoose = require('mongoose');
const conStr = CONFIG.connections.mongoose;

mongoose.connect(conStr);

const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String
});

const User = mongoose.model('User', userSchema);

User.collection.insertMany(users, () => {
    mongoose.disconnect();
});
