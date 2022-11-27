const db = require("mongoose");
require("dotenv").config();
const db_url = process.env.DB_URL;
const test_db_url = "mongodb://localhost:27017/test_bot";
db.connect(db_url).then((res) => console.log("connected"));
const User = require("../db/models/user");
const Payment = require("../db/models/payment");
const EndedSubs = require("../db/models/endedSubs");
module.exports = db;
