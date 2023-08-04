const userName = 'Max';
let userAge = 28;
let hasHobbies = true

const userSummary = (name, age, hobbies) => {
  return `Name is: ${name}, age is: ${age}, and the user has hobbies: ${hobbies}`
}

const add = (a, b) => a + b;
const addOne = (a) => a + 1;

console.log(add(1, 2));
console.log(addOne(1));

console.log(userSummary(userName, userAge, hasHobbies));   