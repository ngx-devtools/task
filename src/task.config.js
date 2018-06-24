
const { copy, clean, watcher, devtools } = require('@ngx-devtools/common');

const { build, onClientFileChanged, vendorBundle } = require('@ngx-devtools/build');
const { serverStart } = require('@ngx-devtools/server');

const { getTasks } = require('./get-tasks');
const { symlink } = require('./symlink');

let _tasks = [];

const registerTasks = (obj, gulp) => {
  _tasks = getTasks(obj);
  _tasks.forEach(task => gulp.task(task, done => {
    return obj[task.toCamelCase()]();
  }));
  return obj;
};

class TaskConfig { 

  static registerTasks(gulp = require('gulp')) {
    return registerTasks(new this(), gulp);
  }

  tasks() {
    return Promise.all(_tasks.map(task => console.log(`- ${task}`)));
  }

  linkDist() {
    return symlink();
  }

  build() { 
    return build(); 
  }

  cleanDist() {
    return clean('dist')
  }

  cleanTmp() {
    return clean('.tmp');
  }

  copyFiles() {
    const configs = (devtools && devtools['tasks'] && devtools.tasks['copy.files'] 
      ? devtools.tasks['copy.files'] : []);
    const srcConfigs = [{ src: 'src/*.html', dest: 'dist' }].concat(configs);
    return Promise.all(srcConfigs.map(config => copy(config)));
  }

  serverStart() {
    return serverStart();
  }

  vendorBundle() {
    return vendorBundle();
  }

  watcher() {
    return watcher({ onClientFileChanged });
  }

  default() {
    return Promise.all([ this.copyFiles(), this.build() ])
      .then(() => Promise.all([ this.serverStart(), this.watcher() ]));
  }  

}

exports.TaskConfig = TaskConfig;