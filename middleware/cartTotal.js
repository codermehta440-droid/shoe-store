const User = require('../models/signup');

module.exports = async (req, res, next) => {

    res.locals.totalPrice = 0;

    try {

        if (req.session.user && req.session.user._id) {

            const userData = await User.findById(req.session.user._id);

            if (userData && Array.isArray(userData.cart)) {

                let total = 0;

                userData.cart.forEach(item => {
                    if (item && typeof item.price === 'number' && typeof item.quantity === 'number') {
                        total += item.price * item.quantity;
                    }
                });

                res.locals.totalPrice = total;

            }

        }

        next();

    } catch (err) {

        console.error('cartTotal middleware error:', err);
        next();

    }

};