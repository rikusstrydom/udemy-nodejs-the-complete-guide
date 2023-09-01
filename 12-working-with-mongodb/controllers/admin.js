const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  const { user } = req;
  Product.fetchAll()
    .then((products) => {
      res.render('admin/product-list', {
        pageTitle: 'Admin Products',
        path: '/admin/products',
        products,
      });
    })
    .catch((err) => console.log(err));
};

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const { user } = req;
  const { title, imageUrl, price, description } = req.body;
  const product = new Product(title, price, description, imageUrl, null, user._id);
  product
    .save()
    .then(() => {
      res.redirect('/');
    })
    .catch((err) => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const { user } = req;
  const { productId } = req.params;
  const editMode = req.query.edit;
  Product.findById(productId)
    .then((product) => {
      if (!product) res.redirect('/');

      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: Boolean(editMode),
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const { title, imageUrl, price, description } = req.body;
  const product = new Product(title, price, description, imageUrl, productId);
  return product
    .save()
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.deleteById(productId)
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
};
