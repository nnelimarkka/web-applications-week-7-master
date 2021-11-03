const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let userSchema = new Schema ({
    user: String,
    items: [String]
});

module.exports = mongoose.model("Todo", userSchema);