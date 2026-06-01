const express = require('express');
const storeRouter = express.Router();

const storeControllers = require('../controllers/storeControllers');

storeRouter.get('/', storeControllers.getHomes);

storeRouter.get('/signup', storeControllers.getSignup);
storeRouter.get('/login', storeControllers.getLogin);
storeRouter.get('/search', storeControllers.getSearchResults);
storeRouter.get('/details/:productId', storeControllers.getProDetails)


storeRouter.post('/signup', storeControllers.postSignup); 
storeRouter.post('/login', storeControllers.postLogin);
storeRouter.post('/logout', storeControllers.postLogout)

// CART ROUTES
// storeRouter.get('/cart/:productId', storeControllers.getCartPage);
storeRouter.post('/cart/add/:productId', storeControllers.postAddToCart);
storeRouter.post('/cart/buy-now/:productId', storeControllers.postBuyNow);
storeRouter.get('/cart', storeControllers.getCartPage);
storeRouter.get('/cart/delete/:productId', storeControllers.getDeleteCartItem);

storeRouter.post('/place-order', storeControllers.postPlaceOrder);
storeRouter.get('/order-tracking', storeControllers.getOrderTracking);
storeRouter.get('/download-bill', storeControllers.getDownloadBill);

// forget pass
storeRouter.get("/forgot-password", storeControllers.getForgotPassword);
storeRouter.post("/forgot-password", storeControllers.postForgotPassword);
storeRouter.get("/reset-password/:token", storeControllers.getResetPassword);
storeRouter.post("/reset-password", storeControllers.postResetPassword);

//email verify to signup
storeRouter.get('/verify-email/:token',storeControllers.verifyEmail);

module.exports = storeRouter; 