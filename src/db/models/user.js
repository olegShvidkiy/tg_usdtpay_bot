const db = require("../db.js");

const schema = new db.Schema({
    tg_username: {
        type: String,
        minlength: 2,
        maxlength: 255,
        trim: true
    },
    tx_id: {
        type: String,
        minlength: 2,
        maxlength: 255,
        trim: true
    },
    start_date: {
        type: Date,
    } 
})