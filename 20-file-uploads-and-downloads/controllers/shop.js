const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Product = require('../models/product');
const Order = require('../models/order');

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('shop/index', {
        pageTitle: 'Shop',
        path: '/',
        products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('shop/product-list', {
        pageTitle: 'All Products',
        path: '/products',
        products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.addToCart = (req, res, next) => {
  const { user } = req;
  const { productId } = req.body;
  Product.findById(productId)
    .then((product) => {
      user.addToCart(product);
      res.redirect('/cart');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteCartItem = (req, res, next) => {
  const { user } = req;
  const { productId } = req.body;
  user
    .removeFromCart(productId)
    .then(() => {
      res.redirect('/cart');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  const { user } = req;
  Order.find({ 'user.userId': user._id })
    .then((orders) => {
      res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders',
        orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
          email: user.email,
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error('No order found'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }

      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join('data', 'invoices', invoiceName);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);

      // Generate PDF

      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', { underline: true });
      pdfDoc.fontSize(16).text('--------------------------------------');

      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.product.price * prod.quantity;
        pdfDoc.text(`${prod.quantity} x ${prod.product.title} - $${prod.product.price} `);
      });

      pdfDoc.text('--------------------------------------');
      pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`);

      pdfDoc.end();

      // Stream file

      const file = fs.createReadStream(invoicePath);
      file.pipe(res);

      // Download file

      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.send(data);
      // });
    })
    .catch((err) => {
      return next(err);
    });
};
