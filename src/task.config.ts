import { existsSync } from 'fs';
import { join, resolve } from 'path';

import { clean, watcher } from '@ngx-devtools/common';
import { serverStart } from '@ngx-devtools/server';
import { onClientFileChanged, vendorBundle } from '@ngx-devtools/build';

import { build, copyAssets } from './build';
import SymLink from './symlink';

import { getTasks, toCamelCase } from './task-list';

const devtoolsPath = join(process.env.APP_ROOT_PATH, '.devtools.json');
const devtools = (existsSync(devtoolsPath)) ? require(devtoolsPath): {}; 

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

  default() {
    return Promise.all([ copyAssets(), build()  ])
      .then(() => Promise.all([ serverStart(), watcher({ onClientFileChanged }) ]))
  }

}