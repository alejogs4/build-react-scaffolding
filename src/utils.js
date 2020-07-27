const fs = require('fs');
const { curry } = require('ramda');
const { promisify } = require('util');
const { exec } = require('child_process');

const mkdir = promisify(fs.mkdir);
const createFile = promisify(exec);

const divide = curry(function divide(predicate, array) {
  return array.reduce(([ first, second ], currentElement) => {
    switch (predicate(currentElement)) {
      case true:
        return [[...first, currentElement], second];
      case false:
        return [first, [...second, currentElement]];
      default:
        return [first, second];
    }
  }, [[], []]);
});

module.exports = {
  mkdir,
  createFile,
  divide
};
