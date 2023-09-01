const Product = require('../models/product');

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render('shop/index', {
        pageTitle: 'Shop',
        path: '/',
        products,
      });
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render('shop/product-list', {
        pageTitle: 'All Products',
        path: '/products',
        products,
      });
    })
    .catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      res.render('shop/product-detail', {
        pageTitle: 'Product Details',
        path: '/products',
        product,
      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  const { user } = req;
  user
    .getCart()
    .then((products) => {
      return res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        products: products,
      });
    })
    .catch((err) => console.log(err));
};

exports.addToCart = (req, res, next) => {
  const { user } = req;
  const { productId } = req.body;
  Product.findById(productId)
    .then((product) => {
      user.addToCart(product);
      res.redirect('/cart');
    })
    .catch((err) => console.log(err));
};

exports.deleteCartItem = (req, res, next) => {
  const { user } = req;
  const { productId } = req.body;
  user
    .deleteCartItem(productId)
    .then(() => {
      res.redirect('/cart');
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  const { user } = req;
  user
    .getOrders()
    .then((orders) => {
      res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders',
        orders,
      });
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  const { user } = req;
  user
    .addOrder()
    .then((result) => {
      res.redirect('orders');
    })
    .catch((err) => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout',
    // products,
  });
};
