const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    tg_username: {
        type: String,
        minlength: 2,
        maxlength: 255,
        trim: true
    },
    tg_id: {
        type: String, 
        minlength: 2,
        maxlength: 255,
        trim: true
    },
    start_date: {
        type: Date,
        default: Date.now()
    },
    expire_date: Date,
    tx_id: {
        type: String, 
        minlength: 2,
        maxlength: 255,
        trim: true
    },
});

module.exports = mongoose.model("EndedSubs", schema);