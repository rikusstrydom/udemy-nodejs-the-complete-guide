const Product = require('../models/product');
const Order = require('../models/order');

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('shop/index', {
        pageTitle: 'Shop',
        path: '/',
        products,
        isAuthenticated: req.session.user,
      });
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('shop/product-list', {
        pageTitle: 'All Products',
        path: '/products',
        products,
        isAuthenticated: req.session.user,
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
        isAuthenticated: req.session.user,
      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  const { user } = req;
  user
    .populate('cart.items.productId')
    .then((user) => {
      const products = user.cart.items;
      return res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        products: products,
        isAuthenticated: req.session.user,
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
    .removeFromCart(productId)
    .then(() => {
      res.redirect('/cart');
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  const { user } = req;
  Order.find({ 'user.userId': user._id })
    .then((orders) => {
      res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders',
        orders,
        isAuthenticated: req.session.user,
      });
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  const { user } = req;
  user
    .populate('cart.items.productId')
    .then((user) => {
      const products = user.cart.items.map((product) => {
        return {
          quantity: product.quantity,
          product: { ...product.productId._doc },
        };
      });
      const order = new Order({
        user: {
          userId: user._id,
          name: user.name,
        },
        products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
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
    isAuthenticated: req.session.user,
  });
};
