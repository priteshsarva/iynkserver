const mongoose = require('mongoose');

const channelCategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
    },
    subReddits: {
        type: Array,
        required: false,
    }
})

const channelCategory = mongoose.model("CHANNELCATEGORY", channelCategorySchema);

module.exports = channelCategory;