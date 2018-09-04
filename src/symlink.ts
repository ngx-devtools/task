import { join, dirname } from 'path';
import { isString } from 'util';
import { readdirAsync, readFileAsync, mkdirp, symlinkAsync, symlinkDir, clean, unlinkAsync } from '@ngx-devtools/common';
import { existsSync, statSync, readlinkSync } from 'fs';

export interface ModuleKey {
  libs: string[];
  elements: string[];
}

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

  static async mono(modules: any) {
    const keys = Object.keys(modules);
    return Promise.all(keys.map(key => {
      const value = <ModuleKey>modules[key];
      return Promise.all([ SymLink.linkLibs(key, value.libs), SymLink.linkElements(key, value.elements) ])
    }))
  }

  private static async linkMonorepo(key: string, folder: string) {
    const srcPath = join(process.env.APP_ROOT_PATH, key, 'src', folder);
    const destPath = join(process.env.APP_ROOT_PATH, 'src', folder);
    const isWin = (process.platform === 'win32');
    mkdirp(dirname(destPath));
    return symlinkAsync(srcPath, destPath, isWin ? 'junction': 'dir')
  }

  private static linkElements(key: string, elements: string[]) {
    return Promise.all(elements.map(element => SymLink.linkMonorepo(key, `elements/${element}`)))
  }

  private static linkLibs(key:string, libs: string[]) {
    return Promise.all(libs.map(lib => SymLink.linkMonorepo(key, `libs/${lib}`)));
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

