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
    }
});

module.exports = mongoose.model("Admin", schema);