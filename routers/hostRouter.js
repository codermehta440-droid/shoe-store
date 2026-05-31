const express = require('express');

const hostRouter = express.Router();

const hostControllers = require('../controllers/hostControllers');

hostRouter.get('/', hostControllers.getHostHomes)
hostRouter.get('/add-product', hostControllers.getAddProduct);
hostRouter.get('/editProduct/:productId', hostControllers.getEditProduct);
hostRouter.get('/host-products', hostControllers.getHostProducts);
hostRouter.get('/hostLogin', hostControllers.getLogin)
hostRouter.post('/specialOffer', hostControllers.postspecialOffer)

hostRouter.post('/add-product', hostControllers.postAddProduct)
hostRouter.post('/edit-product', hostControllers.postEditProduct);
hostRouter.post('/delete-product',hostControllers.postDeleteProduct);
hostRouter.post('/hostLogin', hostControllers.postLogin)


module.exports = hostRouter;