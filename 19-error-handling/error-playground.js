const sum = (a, b) => {
  if (a && b) {
    return a + b;
  }
  throw new Error('Invalid Argument');
};

try {
  console.log(sum(1));
} catch (error) {
  console.log('Error occurred', error);
}
