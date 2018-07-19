import { join, dirname } from 'path';
import { isString } from 'util';
import { readdirAsync, readFileAsync, mkdirp, symlinkAsync } from '@ngx-devtools/common';

export default class SymLink {

  static async symlink(src: string) {
    const folders = await readdirAsync(src);
    return Promise.all(folders.map(async folder => {
      const pkgPath = join(process.env.APP_ROOT_PATH, 'dist', folder, 'package.json');
      const { scope, pkgName } = await this.readFile(pkgPath);
      const destPath = (scope === pkgName) 
        ? join(process.env.APP_ROOT_PATH, 'node_modules', pkgName)
        : join(process.env.APP_ROOT_PATH, 'node_modules', scope, pkgName);
      mkdirp(dirname(destPath));
      return symlinkAsync(dirname(pkgPath), destPath);
    }))
  } 

  private static getPkgName(content) {
    if (isString(content)) content = JSON.parse(content);
    const names = content.name.split('/');
    return { 
      scope: ((names.length < 2) ? content.name : names[0]), 
      pkgName: ((names.length < 2) ? content.name : names[1]) 
    }
  }

  private static async readFile(pkgPath: string) {
    const content = await readFileAsync(pkgPath, 'utf8')
    return this.getPkgName(content);
  }

}

