const User = require('../models/signUp');

module.exports = async (req, res, next) => {

    res.locals.totalPrice = 0;

    try {

        if (req.session.user && req.session.user._id) {

            const userData = await User.findById(req.session.user._id);

            if (userData && userData.cart) {

                let total = 0;

                userData.cart.forEach(item => {
                    total += item.price * item.quantity;
                });

                res.locals.totalPrice = total;

            }

        }

        next();

    } catch (err) {

        console.log(err);
        next();

    }

};