import { resolve } from 'path';

import { clean, watcher } from '@ngx-devtools/common';
import { DevServer } from '@ngx-devtools/server';
import { onClientFileChanged, vendorBundle } from '@ngx-devtools/build';

import { build, copyAssets } from './build';
import SymLink from './symlink';

import { getTasks, toCamelCase } from './task-list';

if (!(process.env.APP_ROOT_PATH)) {
  process.env.APP_ROOT_PATH = resolve();
}

export class TaskConfig {

  static tasks: string[] = [];

  static registerTasks(gulp = require('gulp')) {
    return this._registerTasks(new this(), gulp);
  }

  static _registerTasks(obj: any, gulp: any) {
    this.tasks = getTasks(obj);
    for (let i = 0; i < this.tasks.length; i++) {
      const task = this.tasks[i]
      gulp.task(task, done => {
        return obj[toCamelCase(task)]();
      });
    }
  }

  cleanDist() {
    return clean('dist')
  }

  cleanTmp() {
    return clean('.tmp');
  }

  symlink() {
    return SymLink.symlink('dist');
  }

  build() {
    return build();
  }

  vendorBundle() {
    return vendorBundle('node_modules/.tmp');
  }

  postInstall(){
    return Promise.all([ build(), vendorBundle('node_modules/.tmp') ])
  }

  default() {
    return Promise.all([ copyAssets(), build() ]).then(() => {
      return Promise.all([ DevServer.start(), watcher({ onClientFileChanged }) ]) 
    })
  }

}