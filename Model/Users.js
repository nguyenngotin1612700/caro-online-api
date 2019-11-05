const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: String,
    name: String,
    phone: String,
    gender: String,
    password: String
});

module.exports = mongoose.model("Users", userSchema);