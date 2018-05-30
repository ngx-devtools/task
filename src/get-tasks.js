const util = require('util');

const getTasks = (obj) => {
  let props = [];
  do {
    const result = Object.getOwnPropertyNames(obj)
      .concat(Object.getOwnPropertySymbols(obj).map(s => s.toString()))
      .filter(s => (util.isFunction(obj[s]) && s !== 'constructor'))
      .map(fn => fn.toDotCase());
    props = props.concat(result);
  } while ((obj = Object.getPrototypeOf(obj)) && Object.getPrototypeOf(obj))  
  return props;
};

exports.getTasks = getTasks;