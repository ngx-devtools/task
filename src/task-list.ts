const util = require('util');

const toDotCase = (str: string) => {
  return str.replace(/(?!^)([A-Z])/g, ' $1')
    .replace(/[_\s]+(?=[a-zA-Z])/g, '.')
    .toLowerCase();  
};

const toSpaceCase = (str: string) => {
  return str.replace(/[\W_]+(.|$)/g, (matches, match) => {
    return match ? ' ' + match : ''
  }).trim();
};

const toCamelCase = (str: string) => {
  const _toCamelCase = (str: string) => {
    return str.replace(/\s(\w)/g, (matches, letter) => {
      return letter.toUpperCase()
    })   
  };
  return _toCamelCase(toSpaceCase(str));
}

const getTasks = (obj: any) => {
  let props = [];
  do {
    const result = Object.getOwnPropertyNames(obj)
      .concat(Object.getOwnPropertySymbols(obj).map(s => s.toString()))
      .filter(s => (util.isFunction(obj[s]) && s !== 'constructor'))
      .map(fn => toDotCase(fn));
    props = props.concat(result);
  } while ((obj = Object.getPrototypeOf(obj)) && Object.getPrototypeOf(obj))  
  return props;
};

export { getTasks, toSpaceCase, toCamelCase }