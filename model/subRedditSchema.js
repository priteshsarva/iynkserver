const mongoose = require('mongoose');

const subRedditSchema = new mongoose.Schema({
    subRedditName: {
        type: String,
        required: true,
    },
    subRedditUrl: {
        type: String,
        required: true,
    },
    subRedditImageUrl: {
        type: String,
        required: false,
    },
    subRedditCategory: {
        type: Array,
        required: false,
    }
})

const subReddit = mongoose.model("SUBREDDIT", subRedditSchema);

module.exports = subReddit;