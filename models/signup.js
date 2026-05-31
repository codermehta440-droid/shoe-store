const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    resetToken: String,
    resetTokenExpiration: Date,

    isVerified: {
        type: Boolean,
        default: false
    },

    verifyToken: String,

    verifyTokenExpiration: Date,

    resetToken: String,

    resetTokenExpiration: Date,

    cart: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },

            title: String,

            description: String,

            price: Number,

            image: String,

            quantity: Number
        }
    ],

    orders: [
        {
            items: Array,
            totalPrice: Number,
            paymentMethod: String,
            orderedAt: Date
        }
    ]

});


// Nayi line (Fix):
module.exports = mongoose.models.User || mongoose.model('User', userSchema);