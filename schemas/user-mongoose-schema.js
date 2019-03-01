const mongoose = require('mongoose');

export const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String
});