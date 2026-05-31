const { check, validationResult } = require("express-validator");
const User = require("../models/signup");

const bcrypt = require('bcryptjs');
const product = require("../models/product"); 
const PDFDocument = require('pdfkit');

const crypto = require('node:crypto');
const transporter = require("../utils/mailer");

exports.getHomes = async (req, res, next) => {

    const specialProducts = await product.find({
        isSpecialOffer: true
    });

    res.render('store/home', { specialProducts, editing: false, isLoggedIn: req.session.isLoggedIn, user: req.session.user, isHostLoggedIn: req.session.isHostLoggedIn, host: req.session.host });
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

    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }

    try {

        const productId = req.params.productId;

        const foundProduct = await product.findById(productId);

        if (!foundProduct) {
            return res.send("Product not found");
        }

        res.render('store/productDetails', {
            product: foundProduct,
            isLoggedIn: req.session.isLoggedIn,
            isHostLoggedIn: req.session.isHostLoggedIn,
            user: req.session.user
        });

    } catch (err) {
        console.log(err);
    }
};

exports.getLogin = (req, res, next) => {

    res.render('auth/login', {
        isLoggedIn: false,
        isloginpage: true,
        ishostloginpage: false,
        pageTitle: "Login Page",
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
        .withMessage("Name should be atleast 4 characters long")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("First name should contain only alphabets"),

    check('email')
        .isEmail()
        .withMessage("Please enter a valid email")
        .normalizeEmail(),

    check('password')
        .isLength({ min: 8 })
        .withMessage("Password should be at least 8 charcarter long")
        .matches(/[A-Z]/)
        .withMessage("Password should be contain atleast one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password should be contain atleast one lowercase letter")
        .matches(/[0-9]/)
        .withMessage("Password should be contain atleast one number")
        .matches(/[!@&]/)
        .withMessage("Password should be contain atleast one special character")
        .trim(),

    check('confPass')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Password do not match")
            }
            return true;
        }),

    async (req, res, next) => {
        try {

            console.log('Getting user info', req.body);

            const { fullName, email, password, confPass } = req.body;

            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(422).render('auth/signup', {
                    pageTitle: "Signup",
                    currentPage: "Signup",
                    isLoggedIn: false,
                    isloginpage: false,
                    ishostloginpage: false,
                    errors: errors.array().map(err => err.msg),
                    oldInput: { fullName, email, password, confPass },
                });
            }

            const existingUser = await User.findOne({ email });

            if (existingUser) {
                return res.status(422).render('auth/signup', {
                    pageTitle: "Signup",
                    currentPage: "Signup",
                    isLoggedIn: false,
                    isloginpage: false,
                    ishostloginpage: false,
                    errors: ["Email already exists"],
                    oldInput: { fullName, email, password, confPass },
                });
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const token = crypto
                .randomBytes(32)
                .toString('hex');

            const userinfo = new User({

                fullName,

                email,

                password: hashedPassword,

                isVerified: false,

                verifyToken: token,

                verifyTokenExpiration:
                    Date.now() + 24 * 60 * 60 * 1000

            });

            await userinfo.save();

            const verifyLink =
                `${process.env.BASE_URL}/verify-email/${token}`;

            await transporter.sendMail({

                from: process.env.EMAIL_USER,

                to: email,

                subject: 'Verify Your Email',

                html: `

        <h2>Welcome ${fullName}</h2>

        <p>
            Click below button
            to verify your email.
        </p>

        <a href="${verifyLink}">
            Verify Email
        </a>

        <p>
            Link expires in 24 hours.
        </p>

    `
            });

            console.log("After Save");

            req.session.isLoggedIn = true;

            return res.render('auth/login', {

                isloginpage: true,
                ishostloginpage: false,

                error: [
                    'Verification email sent. Please check your inbox.'
                ],

                oldInput: {
                    email: '',
                    password: ''
                }

            });

        } catch (err) {
            console.log(err);
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

    const user = await User.findOne({ email });

    if (!user) {
        return res.render('auth/login', {
            isloginpage: true,
            ishostloginpage: false,
            error: ['Invalid email or password'],
            oldInput: { email, password }
        });
    }

    if (!user.isVerified) {
        return res.render('auth/login', {
            isloginpage: true,
            ishostloginpage: false,
            error: ['Please verify your email first'],
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

    req.session.isLoggedIn = true;

    req.session.user = {
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email
    };

    req.session.save((err) => {

        if (err) {
            console.log(err);
        }

        res.redirect('/');
    });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
}

// get cart page
exports.getCartPage = async (req, res, next) => {

    try {

        if (!req.session.user) {
            return res.redirect('/login');
        }

        const userData = await User.findById(req.session.user._id);

        if (!userData) {
            return res.redirect('/login');
        }

        const cartItems = userData.cart || [];

        let totalPrice = 0;

        cartItems.forEach(item => {
            totalPrice += item.price * item.quantity;
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
        console.log(err);
    }

};

exports.postAddToCart = async (req, res, next) => {

    try {

        const productId = req.params.productId;

        const foundProduct = await product.findById(productId);

        if (!foundProduct) {
            return res.send("Product not found");
        }

        const userData = await User.findById(req.session.user._id);

        const existingProductIndex = userData.cart.findIndex(item => {
            return item.productId.toString() === productId;
        });

        if (existingProductIndex >= 0) {

            userData.cart[existingProductIndex].quantity += 1;

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

        res.redirect('/cart');

    } catch (err) {
        console.log(err);
    }

};

exports.getDeleteCartItem = async (req, res, next) => {

    try {

        const productId = req.params.productId;

        const userData = await User.findById(req.session.user._id);

        userData.cart = userData.cart.filter(item => {
            return item.productId.toString() !== productId;
        });

        await userData.save();

        res.redirect('/cart');

    } catch (err) {
        console.log(err);
    }

};

exports.postPlaceOrder = async (req, res, next) => {

    try {

        const userData = await User.findById(req.session.user._id);

        if (!userData || userData.cart.length === 0) {
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
        const user = await User.findOne({ email });

        // CRITICAL FIX: Add "return" here so code stops executing if user doesn't exist
        if (!user) {
            return res.render('auth/forgotPassword', {
                isLoggedIn: false,
                isloginpage: false,
                ishostloginpage: false,
                error: ['No account found with this email'],
                success: null,
                oldInput: { email }
            });
        }

        // Yeh code tabhi chalega jab user sach mein exist karta ho
        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour

        await user.save();

        const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Request",
            html: `
                <h2>Password Reset</h2>
                <p>Click below link to reset password:</p>
                <a href="${resetLink}">Reset Password</a>
                <p>This link expires in 1 hour.</p>
            `
        });

        res.render('auth/forgotPassword', {
            isLoggedIn: false,
            isloginpage: false,
            ishostloginpage: false,
            error: [],
            success: 'Reset link sent to your email',
            oldInput: { email: '' }
        });

    } catch (err) {
        console.log(err);
        // Catch block fix: Safe fallback taaki server hang na ho agar koi mail send hone mein dikkat aaye
        res.status(500).send("Something went wrong on the server.");
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
