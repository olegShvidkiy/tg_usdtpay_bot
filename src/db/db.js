const db = require('mongoose');
require('dotenv').config();
// 'mongodb+srv://oleg:oleg15101978@cluster0.140cig5.mongodb.net/?retryWrites=true&w=majority'
const db_url = process.env.DB_URL;
db.connect("mongodb://localhost:27017/test_bot").then(res=>console.log("connected"));
const User = require("../db/models/user");
const Payment = require("../db/models/payment");

module.exports = db;
