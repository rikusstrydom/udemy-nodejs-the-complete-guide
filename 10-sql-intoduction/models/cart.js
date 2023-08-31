const fs = require('fs');
const path = require('path');
const rootDir = require('../util/path');

const filePath = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {
  static addProduct(id, productPrice) {
    fs.readFile(filePath, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };

      if (!err) {
        cart = JSON.parse(fileContent);
      }

      const existingProductIndex = cart.products.findIndex((f) => f.id === id);
      const existingProduct = cart.products[existingProductIndex];

      let updatedProduct;

      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }

      cart.totalPrice = cart.totalPrice + +productPrice;
      fs.writeFile(filePath, JSON.stringify(cart), (err) => {
        console.log('err', err);
      });
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(filePath, (err, fileContent) => {
      if (err) return;
      const cart = { ...JSON.parse(fileContent) };
      const product = cart.products.find((f) => f.id === id);
      if (!product) return;

      const productQty = product.qty;
      cart.products = cart.products.filter((f) => f.id !== id);
      cart.totalPrice = cart.totalPrice - productPrice * productQty;

      fs.writeFile(filePath, JSON.stringify(cart), (err) => {
        console.log('err', err);
      });
    });
  }

  static getCart(callback) {
    fs.readFile(filePath, (err, fileContent) => {
      if (err) {
        callback(null);
      } else {
        const cart = JSON.parse(fileContent);
        callback(cart);
      }
    });
  }
};
