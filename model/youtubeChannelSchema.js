const mongoose = require('mongoose');

const youtubeChannelSchema = new mongoose.Schema({
    youtubeChannellName: {
        type: String,
        required: true,
    },
    youtubeChannellURL: {
        type: String,
        required: true,
    },
    profilePictureUrl: {
        type: String,
        required: true,
    },
    youtubecategory: {
        type: Array,
        required: true,
    },
    latestVideoTitle: {
        type: String,
        required: false,
    },
    latestVideoURL: {
        type: String,
        required: false,
    },
    Date: {
        type: Date,
        required: true,
    }
})

const YoutubeChannelList = mongoose.model("YOUTUBECHANNELLIST", youtubeChannelSchema);

module.exports = YoutubeChannelList;