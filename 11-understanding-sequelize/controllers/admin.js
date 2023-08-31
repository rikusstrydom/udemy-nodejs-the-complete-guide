const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  const { user } = req;
  user
    .getProducts()
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
  user
    .createProduct({
      title,
      price,
      description,
      imageUrl,
    })
    .then(() => {
      res.redirect('/');
    })
    .catch((err) => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const { user } = req;
  const { productId } = req.params;
  const editMode = req.query.edit;
  user
    .getProducts(productId)
    .then((products) => {
      const product = products[0];
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
  Product.findByPk(productId)
    .then((product) => {
      product.title = title;
      product.price = price;
      product.description = description;
      product.imageUrl = imageUrl;
      return product.save();
    })
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.findByPk(productId)
    .then((product) => {
      return product.destroy();
    })
    .then(() => {
      console.log('Product deleted!');
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));

  // Alternative
  // Product.destroy({ where: { id: productId } })
  //   .then(() => {
  //     res.redirect('/admin/products');
  //   })
  //   .catch((err) => console.log(err));
};
