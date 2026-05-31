const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    title: String,

    price: Number,

    category: String,

    image: String,

    description: String,

    isSpecialOffer: {
        type: Boolean,
        default: false
    },

    host: {
        userId: String,
        fullName: String
    }

});

module.exports = mongoose.model('Product', productSchema);