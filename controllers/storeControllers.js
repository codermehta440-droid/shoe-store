const { check, validationResult } = require("express-validator");
const mongoose = require('mongoose');
const User = require("../models/signup");

const bcrypt = require('bcryptjs');
const product = require("../models/product");
const PDFDocument = require('pdfkit');

const crypto = require('crypto');
const { sendMail } = require("../utils/mailer");

exports.getHomes = async (req, res, next) => {
    try {
        const query = (req.query.q || '').trim();

        const specialProducts = await product.find({
            isSpecialOffer: true
        });

        const popularProducts = await product.find().limit(8);

        res.render('store/home', {
            specialProducts,
            popularProducts,
            query,
            editing: false,
            isLoggedIn: req.session.isLoggedIn,
            user: req.session.user,
            isHostLoggedIn: req.session.isHostLoggedIn,
            host: req.session.host
        });
    } catch (err) {
        console.error('Home page error:', err);
        res.render('store/home', {
            specialProducts: [],
            popularProducts: [],
            query: '',
            editing: false,
            isLoggedIn: req.session.isLoggedIn,
            user: req.session.user,
            isHostLoggedIn: req.session.isHostLoggedIn,
            host: req.session.host
        });
    }
};

exports.getSearchResults = async (req, res, next) => {
    try {
        const query = (req.query.q || '').trim();

        let products = [];
        if (query) {
            products = await product.find({
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { category: { $regex: query, $options: 'i' } }
                ]
            });
        }

        res.render('store/search', {
            query,
            products,
            isLoggedIn: req.session.isLoggedIn,
            isHostLoggedIn: req.session.isHostLoggedIn,
            user: req.session.user,
            host: req.session.host
        });
    } catch (err) {
        console.error('Search error:', err);
        res.redirect('/');
    }
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        isLoggedIn: false,
        isloginpage: false,
        ishostloginpage: false,
        errors: [],
        oldInput: {
            fullName: '',
            email: '',
            password: '',
            confPass: ''
        }
    });
};

// get product details
// get product details
exports.getProDetails = async (req, res, next) => {

    // allow guests to view product details (don't force login)

    try {

        const productId = req.params.productId;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(404).send('Product not found');
        }

        const foundProduct = await product.findById(productId);

        if (!foundProduct) {
            return res.status(404).send('Product not found');
        }

        res.render('store/productDetails', {
            product: foundProduct,
            isLoggedIn: !!req.session.isLoggedIn,
            isHostLoggedIn: !!req.session.isHostLoggedIn,
            user: req.session.user || null
        });

    } catch (err) {
        console.error('getProDetails error:', err);
        return res.status(500).send('Internal Server Error');
    }
};

exports.getLogin = (req, res, next) => {

    res.render('auth/login', {
        isLoggedIn: false,
        isloginpage: true,
        ishostloginpage: false,
        pageTitle: "Login Page",
        query: req.query?.q || '',
        error: [],
        oldInput: {
            email: "",
            password: ""
        },
    });
};

exports.postSignup = [
    check('fullName')
        .trim()
        .isLength({ min: 4 })
        .withMessage("Name should be at least 4 characters long")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("Name should contain only alphabets"),

    check('email')
        .isEmail()
        .withMessage("Please enter a valid email")
        .normalizeEmail(),

    check('password')
        .isLength({ min: 8 })
        .withMessage("Password should be at least 8 characters long")
        .matches(/[A-Z]/).withMessage("Must contain uppercase letter")
        .matches(/[a-z]/).withMessage("Must contain lowercase letter")
        .matches(/[0-9]/).withMessage("Must contain a number")
        .matches(/[!@&]/).withMessage("Must contain a special character")
        .trim(),

    check('confPass')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),

    async (req, res, next) => {
        const { fullName, email, password, confPass } = req.body;

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).render('auth/signup', {
                    isLoggedIn: false,
                    isloginpage: false,
                    ishostloginpage: false,
                    errors: errors.array().map(e => e.msg),
                    oldInput: { fullName, email, password, confPass }
                });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(422).render('auth/signup', {
                    isLoggedIn: false,
                    isloginpage: false,
                    ishostloginpage: false,
                    errors: ["Email already exists"],
                    oldInput: { fullName, email, password, confPass }
                });
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const token = crypto.randomBytes(32).toString('hex');

            const user = new User({
                fullName,
                email,
                password: hashedPassword,
                isVerified: false,
                verifyToken: token,
                verifyTokenExpiration: Date.now() + 24 * 60 * 60 * 1000,
                cart: [],
                orders: []
            });

            await user.save();

            // send verification email asynchronously and don't block signup flow
            try {
                const verifyLink = `${process.env.BASE_URL}/verify-email/${token}`;
                sendMail({
                    to: email,
                    subject: 'Verify Your Email',
                    html: `
                        <h2>Welcome ${fullName}</h2>
                        <p>Click below to verify your email:</p>
                        <a href="${verifyLink}">Verify Email</a>
                        <p>This link expires in 24 hours.</p>
                    `
                }).catch(err => {
                    console.error('Signup: email send failed (non-blocking):', err && err.message ? err.message : err);
                });
            } catch (mailErr) {
                console.error('Signup: unexpected mailer error:', mailErr);
            }

            // create session and redirect to home (signup succeeds even if email fails)
            req.session.isLoggedIn = true;
            req.session.user = {
                _id: user._id.toString(),
                fullName,
                email
            };

            req.session.save(() => {
                return res.redirect('/');
            });

        } catch (err) {
            console.error('Signup Error:', err);
            return res.status(500).render('auth/signup', {
                isLoggedIn: false,
                isloginpage: false,
                ishostloginpage: false,
                errors: ["Something went wrong. Please try again later."],
                oldInput: { fullName: req.body.fullName, email: req.body.email, password: '', confPass: '' }
            });
        }
    }
];

//verify email
exports.verifyEmail = async (req, res, next) => {

    try {

        const token =
            req.params.token;

        const user =
            await User.findOne({

                verifyToken: token,

                verifyTokenExpiration: {
                    $gt: Date.now()
                }

            });

        if (!user) {

            return res.send(
                'Invalid or Expired Verification Link'
            );

        }

        user.isVerified = true;

        user.verifyToken = undefined;

        user.verifyTokenExpiration =
            undefined;

        await user.save();

        res.redirect('/login');

    } catch (err) {

        console.log(err);

    }

};

exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.render('auth/login', {
                isloginpage: true,
                ishostloginpage: false,
                error: ['Invalid email or password'],
                oldInput: { email, password }
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render('auth/login', {
                isloginpage: true,
                isLoggedIn: false,
                isHostLoggedIn: false,
                ishostloginpage: false,
                error: ["Invalid password"],
                oldInput: { email, password },
            });
        }

        // login user even if email verification is pending; do not let email delivery issues block access
        req.session.isLoggedIn = true;
        req.session.user = {
            _id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            isVerified: user.isVerified || false
        };

        // if not verified, set a one-time warning flag to show on UI
        if (!user.isVerified) {
            req.session.unverifiedEmail = true;
        }

        req.session.save((err) => {
            if (err) console.error('Session save error on login:', err);
            return res.redirect('/');
        });

    } catch (err) {
        console.error('Login Error:', err);
        return res.status(500).render('auth/login', {
            isloginpage: true,
            ishostloginpage: false,
            error: ['Unable to login. Please try again later.'],
            oldInput: { email: req.body.email, password: '' }
        });
    }
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
}

// get cart page
exports.getCartPage = async (req, res, next) => {

    try {
        let cartItems = [];
        let userData = null;

        if (req.session.user && req.session.user._id) {
            userData = await User.findById(req.session.user._id);
        }

        if (userData) {
            cartItems = Array.isArray(userData.cart) ? userData.cart.filter(item => item && typeof item === 'object') : [];
        } else {
            cartItems = Array.isArray(req.session.guestCart) ? req.session.guestCart.filter(item => item && typeof item === 'object') : [];
        }

        let totalPrice = 0;

        cartItems.forEach(item => {
            if (item && typeof item.price === 'number' && typeof item.quantity === 'number') {
                totalPrice += item.price * item.quantity;
            }
        });

        res.render('store/cartPage', {
            cartItems,
            totalPrice,
            message: req.session.orderMessage,
            isLoggedIn: req.session.isLoggedIn,
            isHostLoggedIn: req.session.isHostLoggedIn,
            user: req.session.user
        });

        req.session.orderMessage = null;

    } catch (err) {
        console.error('getCartPage error:', err);
        return res.status(500).send('Internal Server Error');
    }

};

exports.postAddToCart = async (req, res, next) => {

    try {

        const productId = req.params.productId;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send('Invalid product ID');
        }

        const foundProduct = await product.findById(productId);

        if (!foundProduct) {
            return res.status(404).send('Product not found');
        }

        if (!req.session.user || !req.session.user._id) {
            req.session.guestCart = req.session.guestCart || [];
            const existingIndex = req.session.guestCart.findIndex(item => item && item.productId === productId);

            if (existingIndex >= 0) {
                req.session.guestCart[existingIndex].quantity = (Number(req.session.guestCart[existingIndex].quantity) || 0) + 1;
            } else {
                req.session.guestCart.push({
                    productId: productId,
                    title: foundProduct.title,
                    description: foundProduct.description,
                    price: foundProduct.price,
                    image: foundProduct.image,
                    quantity: 1
                });
            }

            return req.session.save(() => {
                return res.redirect('/cart');
            });
        }

        const userData = await User.findById(req.session.user._id);

        if (!userData) {
            req.session.guestCart = req.session.guestCart || [];
            const existingIndex = req.session.guestCart.findIndex(item => item && item.productId === productId);

            if (existingIndex >= 0) {
                req.session.guestCart[existingIndex].quantity = (Number(req.session.guestCart[existingIndex].quantity) || 0) + 1;
            } else {
                req.session.guestCart.push({
                    productId: productId,
                    title: foundProduct.title,
                    description: foundProduct.description,
                    price: foundProduct.price,
                    image: foundProduct.image,
                    quantity: 1
                });
            }

            return req.session.save(() => {
                return res.redirect('/cart');
            });
        }

        userData.cart = userData.cart || [];

        const existingProductIndex = userData.cart.findIndex(item => item?.productId?.toString() === productId);

        if (existingProductIndex >= 0) {
            userData.cart[existingProductIndex].quantity = (Number(userData.cart[existingProductIndex].quantity) || 0) + 1;
        } else {
            userData.cart.push({
                productId: foundProduct._id,
                title: foundProduct.title,
                description: foundProduct.description,
                price: foundProduct.price,
                image: foundProduct.image,
                quantity: 1
            });
        }

        await userData.save();

        return res.redirect('/cart');

    } catch (err) {
        console.error('postAddToCart error:', err);
        return res.status(500).send('Internal Server Error');
    }

};

exports.postBuyNow = async (req, res, next) => {
    try {
        const productId = req.params.productId;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send('Invalid product ID');
        }

        const foundProduct = await product.findById(productId);
        if (!foundProduct) {
            return res.status(404).send('Product not found');
        }

        if (!req.session.user) {
            return res.redirect('/login');
        }

        const userData = await User.findById(req.session.user._id);
        if (!userData) {
            return res.redirect('/login');
        }

        userData.cart = userData.cart || [];

        const existingProductIndex = userData.cart.findIndex(item => item?.productId?.toString() === productId);
        if (existingProductIndex >= 0) {
            userData.cart[existingProductIndex].quantity = (Number(userData.cart[existingProductIndex].quantity) || 0) + 1;
        } else {
            userData.cart.push({
                productId: foundProduct._id,
                title: foundProduct.title,
                description: foundProduct.description,
                price: foundProduct.price,
                image: foundProduct.image,
                quantity: 1
            });
        }

        await userData.save();
        return res.redirect('/cart');
    } catch (err) {
        console.error('postBuyNow error:', err);
        return res.status(500).send('Internal Server Error');
    }
};

exports.getDeleteCartItem = async (req, res, next) => {

    try {

        const productId = req.params.productId;

        if (req.session.user && req.session.user._id) {
            const userData = await User.findById(req.session.user._id);
            if (userData) {
                if (Array.isArray(userData.cart)) {
                    userData.cart = userData.cart.filter(item => item && item.productId && item.productId.toString() !== productId);
                } else {
                    userData.cart = [];
                }
                await userData.save();
            }
        } else {
            req.session.guestCart = Array.isArray(req.session.guestCart)
                ? req.session.guestCart.filter(item => item && item.productId !== productId)
                : [];
        }

        return res.redirect('/cart');

    } catch (err) {
        console.error('getDeleteCartItem error:', err);
        return res.status(500).send('Internal Server Error');
    }

};

exports.postPlaceOrder = async (req, res, next) => {

    try {

        if (!req.session.user) {
            return res.redirect('/login');
        }

        const userData = await User.findById(req.session.user._id);

        if (!userData || !userData.cart || userData.cart.length === 0) {
            return res.redirect('/cart');
        }

        // total price
        let totalPrice = 0;

        userData.cart.forEach(item => {
            totalPrice += item.price * item.quantity;
        });

        // order object
        const order = {
            items: userData.cart,
            totalPrice: totalPrice,
            paymentMethod: "Cash On Delivery",
            orderedAt: new Date(),
            status: "Processing"
        };

        // create orders array if not exists
        if (!userData.orders) {
            userData.orders = [];
        }

        // save order
        userData.orders.push(order);

        // clear cart
        userData.cart = [];

        await userData.save();

        // only simple string in session
        req.session.orderMessage = "Order placed successfully!";

        // IMPORTANT
        req.session.save(() => {

            res.redirect('/cart');

        });

    } catch (err) {

        console.log(err);

    }

};


exports.getOrderTracking = async (req, res, next) => {

    try {

        const userData = await User.findById(req.session.user._id);

        if (!userData || !userData.orders || userData.orders.length === 0) {
            return res.redirect('/');
        }

        // latest order
        const latestOrder = userData.orders[userData.orders.length - 1];

        const message = req.session.orderMessage;

        res.render('store/orderTracking', {
            message,
            order: latestOrder,
            isLoggedIn: req.session.isLoggedIn,
            isHostLoggedIn: req.session.isHostLoggedIn,
            user: req.session.user
        });

    } catch (err) {
        console.log(err);
    }

};


exports.getDownloadBill = async (req, res, next) => {

    try {

        const userData = await User.findById(req.session.user._id);

        if (!userData || !userData.orders.length) {
            return res.redirect('/');
        }

        // latest order
        const latestOrder = userData.orders[userData.orders.length - 1];

        // create pdf
        const doc = new PDFDocument({ margin: 50 });

        // filename
        const fileName = `invoice-${Date.now()}.pdf`;

        // response headers
        res.setHeader('Content-Type', 'application/pdf');

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${fileName}"`
        );

        // pipe pdf
        doc.pipe(res);

        // heading
        doc
            .fontSize(24)
            .text('INVOICE', {
                align: 'center'
            });

        doc.moveDown();

        // customer info
        doc
            .fontSize(14)
            .text(`Customer Name: ${req.session.user.fullName}`);

        doc.text(`Payment Method: ${latestOrder.paymentMethod}`);

        doc.text(`Order Status: ${latestOrder.status}`);

        doc.text(
            `Order Date: ${new Date(
                latestOrder.orderedAt
            ).toLocaleString()}`
        );

        doc.moveDown();

        // line
        doc
            .moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke();

        doc.moveDown();

        // items heading
        doc
            .fontSize(18)
            .text('Ordered Items');

        doc.moveDown();

        // items
        latestOrder.items.forEach((item, index) => {

            doc
                .fontSize(14)
                .text(`${index + 1}. ${item.title}`);

            doc.text(`Quantity: ${item.quantity}`);

            doc.text(`Price: ₹${item.price}`);

            doc.text(
                `Total: ₹${item.price * item.quantity}`
            );

            doc.moveDown();

        });

        // total
        doc
            .moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke();

        doc.moveDown();

        doc
            .fontSize(18)
            .text(
                `Grand Total: ₹${latestOrder.totalPrice}`,
                {
                    align: 'right'
                }
            );

        doc.moveDown(2);

        doc
            .fontSize(14)
            .fillColor('green')
            .text(
                'Thank You For Shopping With Us!',
                {
                    align: 'center'
                }
            );

        // end pdf
        doc.end();

    } catch (err) {

        console.log(err);

    }

};

// the forget password

exports.getForgotPassword = (req, res) => {

    res.render('auth/forgotPassword', {
        isLoggedIn: false,
        isloginpage: false,
        ishostloginpage: false,
        error: [],
        success: null,
        oldInput: {
            email: ''
        }
    });

};

exports.postForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('POST /forgot-password received for', email);
        const user = await User.findOne({ email });

        if (!user) {
            console.log('Forgot password: no user found for', email);
            return res.render('auth/forgotPassword', {
                isLoggedIn: false,
                isloginpage: false,
                ishostloginpage: false,
                error: ['No account found with this email'],
                success: null,
                oldInput: { email }
            });
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour

        await user.save();

        const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;

        console.log('Sending reset email to', user.email);
        await sendMail({
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <h2>Password Reset</h2>
                <p>Click below link to reset password:</p>
                <a href="${resetLink}">Reset Password</a>
                <p>This link expires in 1 hour.</p>
            `
        });

        console.log('Reset email sent successfully to', user.email);
        return res.render('auth/forgotPassword', {
            isLoggedIn: false,
            isloginpage: false,
            ishostloginpage: false,
            error: [],
            success: 'Reset link sent to your email',
            oldInput: { email: '' }
        });

    } catch (err) {
        console.error('Forgot password error:', err);
        return res.render('auth/forgotPassword', {
            isLoggedIn: false,
            isloginpage: false,
            ishostloginpage: false,
            error: ['Unable to send reset email. Please try again later.'],
            success: null,
            oldInput: { email: req.body.email }
        });
    }
};

exports.getResetPassword = async (req, res) => {

    try {

        const token = req.params.token;

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: {
                $gt: Date.now()
            }
        });

        if (!user) {

            return res.send(
                "Invalid or Expired Token"
            );

        }

        res.render('auth/resetPassword', {
            token,
            error: [],
            isloginpage: false,
            ishostloginpage: false
        });

    } catch (err) {

        console.log(err);

    }

};

exports.postResetPassword = async (req, res) => {

    try {

        const {
            token,
            password,
            confirmPassword
        } = req.body;

        if (password !== confirmPassword) {

            return res.render(
                "auth/resetPassword",
                {
                    token,
                    error: [
                        "Passwords do not match"
                    ]
                }
            );

        }

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: {
                $gt: Date.now()
            }
        });

        if (!user) {

            return res.send(
                "Invalid or Expired Token"
            );

        }

        const hashedPassword =
            await bcrypt.hash(password, 12);

        user.password = hashedPassword;

        user.resetToken = undefined;

        user.resetTokenExpiration =
            undefined;

        await user.save();

        res.redirect("/login");

    } catch (err) {

        console.log(err);

    }

};
