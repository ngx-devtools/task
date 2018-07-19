import { existsSync } from 'fs';
import { join } from 'path';

import { clean, watcher, copyFiles } from '@ngx-devtools/common';
import { serverStart } from '@ngx-devtools/server';
import { onClientFileChanged, vendorBundle } from '@ngx-devtools/build';
import { build } from './build';

import { getTasks, toCamelCase } from 'task-list';

const devtoolsPath = join(process.env.APP_ROOT_PATH, '.devtools.json');
const devtools = (existsSync(devtoolsPath)) ? require(devtoolsPath): {}; 

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

  copyFiles() {
    const configs = (devtools && devtools['tasks'] && devtools.tasks['copy.files'] ? devtools.tasks['copy.files'] : []);
    const srcConfigs = [{ src: 'src/*.html', dest: 'dist' }].concat(configs);
    return Promise.all(srcConfigs.map(config => {
      return copyFiles(config.src, config.dest);
    }));
  }

  cleanDist() {
    return clean('dist')
  }

  cleanTmp() {
    return clean('.tmp');
  }

  build() {
    return build();
  }

  vendorBundle() {
    return vendorBundle('node_modules/.tmp');
  }

  default() {
    return Promise.all([ this.copyFiles(), build()  ])
      .then(() => Promise.all([ serverStart(), watcher({ onClientFileChanged }) ]))
  }

}