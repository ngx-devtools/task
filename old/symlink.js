const path = require('path');
const util = require('util');

const { readdirAsync, readFileAsync, mkdirp, symlinkAsync } = require('@ngx-devtools/common');

const getPkgName = (content) => {
  if (util.isString(content)) content = JSON.parse(content);
  const names = content.name.split('/');
  return { 
    scope: ((names.length < 2) ? content.name : names[0]), 
    pkgName: ((names.length < 2) ? content.name : names[1]) 
  }
};

const readFile = (pkgPath) => 
    readFileAsync(pkgPath, 'utf8')
      .then(content => getPkgName(content));

const symlink = () => {
  return readdirAsync('dist')
    .then(folders => {
      return Promise.all(folders.map(async folder => {
        const pkgPath = path.resolve(path.join('dist', path.sep, folder, path.sep, 'package.json'));
        const { scope, pkgName } = await readFile(pkgPath);
        const destPath = (scope === pkgName) 
          ? path.join(path.resolve(), 'node_modules', pkgName)
          : path.join(path.resolve(), 'node_modules', scope, pkgName);
        mkdirp(path.dirname(destPath));
        return symlinkAsync(path.dirname(pkgPath), destPath);
      }));
    });  
};

exports.symlink = symlink;
