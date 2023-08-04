//Spread Operator
const hobbies = ['Sports', 'Cooking', 'Programming'];

const copiedArray = [...hobbies];
copiedArray.push('Hiking');

console.log(hobbies);
console.log(copiedArray);

//Rest Operator
const toArray = (...args) => {
  return args
}

console.log(toArray(1, 2, 3));
console.log(toArray(1, 2, 3, 4, 5));