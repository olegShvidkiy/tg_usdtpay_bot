const db = require('mongoose');
db.connect('mongodb+srv://oleg:oleg15101978@cluster0.140cig5.mongodb.net/?retryWrites=true&w=majority').then(res=>console.log("connected"));
const User = require("../db/models/user");
const Payment = require("../db/models/payment");

module.exports = db;
