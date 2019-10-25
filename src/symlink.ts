import { join, dirname } from 'path';
import { isString } from 'util';
import { readdirAsync, readFileAsync, mkdirp, symlinkAsync, LINK_TYPE, clean, unlinkAsync } from '@ngx-devtools/common';
import { existsSync, readlinkSync } from 'fs';

export interface ModuleKey {
  libs?: string[];
  elements?: string[];
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

  static async linkModules(modules: any) {
    const keys = Object.keys(modules);
    return Promise.all(keys.map(key => {
      const value = <ModuleKey>modules[key];
      const libs = value.libs ? value.libs: [];
      const elements = value.elements ? value.elements: [];
      return Promise.all([ 
        Promise.all(libs.map(lib => SymLink.linkMonorepo(key, `libs/${lib}`))), 
        Promise.all(elements.map(element => SymLink.linkMonorepo(key, `elements/${element}`)))
      ])
    }))
  }

  static async unlinkModules(modules: any) {
    const keys = Object.keys(modules);
    return Promise.all(keys.map(key => {
      const value = <ModuleKey>modules[key];
      const libs = value.libs ? value.libs: [];
      const elements = value.elements ? value.elements: [];
      return Promise.all([ 
        Promise.all(libs.map(lib => SymLink.unlinkMonoModules(key, `libs/${lib}`))),
        Promise.all(elements.map(element => SymLink.unlinkMonoModules(key, `elements/${element}`)))
      ])
    }))
  }

  private static async unlinkMonoModules(key: string, folder: string) {
    const srcPath = join(process.env.APP_ROOT_PATH, key, 'src', folder);
    const destPath = join(process.env.APP_ROOT_PATH, 'src', folder);
    return (existsSync(destPath))
      ? (readlinkSync(destPath) === srcPath) ? unlinkAsync(destPath): clean(destPath)
      : Promise.resolve()
  }

  private static async linkMonorepo(key: string, folder: string) {
    const srcPath = join(process.env.APP_ROOT_PATH, key, 'src', folder);
    const destPath = join(process.env.APP_ROOT_PATH, 'src', folder);
    async function unlink() {
      return (existsSync(destPath))
        ? (readlinkSync(destPath) === srcPath) ? unlinkAsync(destPath): clean(destPath)
        : Promise.resolve()
    }
    return unlink().then(() => {
      mkdirp(dirname(destPath));
      return symlinkAsync(srcPath, destPath, (process.platform === 'win32') ? LINK_TYPE.JUNCTION: LINK_TYPE.DIR);
    })
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