const Product = require('../models/product');
const bcrypt = require('bcryptjs');
const Host = require('../models/hostlogin')

exports.getHostHomes = (req, res, next) => {
    res.render('store/home', {
        editing: false,
    })
}
exports.getAddProduct = (req, res, next) => {

    res.render('host/editProduct', {
        editing: false,
        product: {},
        isHostLoggedIn: req.session.isHostLoggedIn,
        host: req.session.host
    });
};

exports.getEditProduct = async (req, res, next) => {

    const product = await Product.findById(req.params.productId);

    res.render('host/editProduct', {
        editing: true,
        product,
        isHostLoggedIn: req.session.isHostLoggedIn,
        host: req.session.host
    });

};

exports.getHostProducts = async (req, res, next) => {

    const products = await Product.find();

    res.render('host/hostProductList', {
        editing: false,
        products,
        isHostLoggedIn: req.session.isHostLoggedIn,
        host: req.session.host
    });

};

exports.getLogin = (req, res, next) => {
    res.render('host/hostLogin', {
        isLoggedIn: false,
        isloginpage: false,
        ishostloginpage: true,
        host: req.session.host,
        error: [],
        oldInput: {
            name: "",
            email: "",
            password: ""
        },
    });
}

exports.postLogin = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        const host = await Host.findOne({ email });

        if (!host) {
            return res.render('host/hostLogin', {
                ishostloginpage: true,
                isloginpage: false,
                host: req.session.host,
                error: ["Host not found"],
                oldInput: { name, email, password },
            });
        }

        const isMatch = await bcrypt.compare(password, host.password);

        if (!isMatch) {
            return res.render('host/hostLogin', {
                ishostloginpage: true,
                isloginpage: false,
                host: req.session.host,
                error: ["Invalid password"],
                oldInput: { name, email, password },
            });
        }

        req.session.isHostLoggedIn = true;
        req.session.isLoggedIn = true;

        req.session.host = {
            _id: host._id.toString(),
            name: host.name,
            email: host.email
        };

        console.log(req.session.host);

        req.session.save((err) => {
            if (err) console.error('Session save error for host login:', err);
            return res.redirect('/');
        });

    } catch (err) {
        console.error('Host login error:', err);
        return res.status(500).render('host/hostLogin', {
            ishostloginpage: true,
            isloginpage: false,
            host: req.session.host,
            error: ['Unable to login. Please try again later.'],
            oldInput: { name: req.body.name, email: req.body.email, password: '' }
        });
    }
};

exports.postAddProduct = async (req, res, next) => {

    try {

        const {
            title,
            price,
            category,
            image,
            description
        } = req.body;

        const product = new Product({

            title,
            price,
            category,
            image,
            description,

            host: {
                userId: req.session.host._id,
                fullName: req.session.host.fullName
            }

        });

        await product.save();

        res.redirect('/host/host-products');

    } catch (err) {

        console.log(err);

    }

};

exports.postEditProduct = async (req, res, next) => {

    try {

        const {
            productId,
            title,
            price,
            category,
            image,
            description
        } = req.body;

        await Product.findByIdAndUpdate(productId, {

            title,
            price,
            category,
            image,
            description

        });

        res.redirect('/host/host-products');

    } catch (err) {

        console.log(err);

    }

};

exports.postDeleteProduct = async (req, res, next) => {

    try {

        const { productId } = req.body;

        await Product.findByIdAndDelete(productId);

        res.redirect('/host/host-products');

    } catch (err) {

        console.log(err);

    }

};


// adding product to special offer
exports.postspecialOffer = async (req, res, next) => {

    try {

        const { productId } = req.body;

        const product = await Product.findById(productId);

        // remove if already added
        if (product.isSpecialOffer) {

            product.isSpecialOffer = false;

            await product.save();

            return res.send(`
                <script>
                    alert("Removed from Special Offer");
                    window.location.href = "/host/host-products";
                </script>
            `);

        }

        // add to special offer
        product.isSpecialOffer = true;

        await product.save();

        return res.send(`
            <script>
                alert("Added to Special Offer");
                window.location.href = "/";
            </script>
        `);

    } catch (err) {

        console.log(err);

        res.send(`
            <script>
                alert("Something went wrong");
                window.location.href = "/host/host-products";
            </script>
        `);

    }

};