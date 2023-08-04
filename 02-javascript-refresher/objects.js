const person = {
  name: 'Rikus',
  age: '30',
  greet() {
    console.log(`Hi, I am, ${this.name}, and I am ${this.age} years old`);
  }
};

person.greet();