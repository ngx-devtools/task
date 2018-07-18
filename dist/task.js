'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib_1 = require('tslib');
var common = require('@ngx-devtools/common');
var build = require('@ngx-devtools/build');
var fs = require('fs');
var path = require('path');
var server = require('@ngx-devtools/server');

var util = require('util');
var toDotCase = function (str) {
    return str.replace(/(?!^)([A-Z])/g, ' $1')
        .replace(/[_\s]+(?=[a-zA-Z])/g, '.')
        .toLowerCase();
};
var toSpaceCase = function (str) {
    return str.replace(/[\W_]+(.|$)/g, function (matches, match) {
        return match ? ' ' + match : '';
    }).trim();
};
var toCamelCase = function (str) {
    var _toCamelCase = function (str) {
        return str.replace(/\s(\w)/g, function (matches, letter) {
            return letter.toUpperCase();
        });
    };
    return _toCamelCase(toSpaceCase(str));
};
var getTasks = function (obj) {
    var props = [];
    do {
        var result = Object.getOwnPropertyNames(obj)
            .concat(Object.getOwnPropertySymbols(obj).map(function (s) { return s.toString(); }))
            .filter(function (s) { return (util.isFunction(obj[s]) && s !== 'constructor'); })
            .map(function (fn) { return toDotCase(fn); });
        props = props.concat(result);
    } while ((obj = Object.getPrototypeOf(obj)) && Object.getPrototypeOf(obj));
    return props;
};

var prodModeParams = ['--prod', '--prod=true', '--prod true'];
var argv = require('yargs')
    .option('pkg', { default: null, type: 'string' })
    .argv;
function build$1() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2, (common.isProcess(prodModeParams))
                    ? Promise.resolve()
                    : build.buildAll()];
        });
    });
}

var devtoolsPath = path.join(process.env.APP_ROOT_PATH, '.devtools.json');
var devtools = (fs.existsSync(devtoolsPath)) ? require(devtoolsPath) : {};
var TaskConfig = (function () {
    function TaskConfig() {
    }
    TaskConfig.registerTasks = function (gulp) {
        if (gulp === void 0) { gulp = require('gulp'); }
        return this._registerTasks(new this(), gulp);
    };
    TaskConfig._registerTasks = function (obj, gulp) {
        this.tasks = getTasks(obj);
        var _loop_1 = function (i) {
            var task = this_1.tasks[i];
            gulp.task(task, function (done) {
                return obj[toCamelCase(task)]();
            });
        };
        var this_1 = this;
        for (var i = 0; i < this.tasks.length; i++) {
            _loop_1(i);
        }
    };
    TaskConfig.prototype.copyFiles = function () {
        var configs = (devtools && devtools['tasks'] && devtools.tasks['copy.files'] ? devtools.tasks['copy.files'] : []);
        var srcConfigs = [{ src: 'src/*.html', dest: 'dist' }].concat(configs);
        return Promise.all(srcConfigs.map(function (config) {
            return common.copyFiles(config.src, config.dest);
        }));
    };
    TaskConfig.prototype.cleanDist = function () {
        return common.clean('dist');
    };
    TaskConfig.prototype.cleanTmp = function () {
        return common.clean('.tmp');
    };
    TaskConfig.prototype.default = function () {
        var _this = this;
        return Promise.all([this.cleanDist(), this.cleanTmp()])
            .then(function () { return Promise.all([_this.copyFiles(), build$1()]); })
            .then(function () { return Promise.all([server.serverStart(), common.watcher({ onClientFileChanged: build.onClientFileChanged })]); });
    };
    TaskConfig.tasks = [];
    return TaskConfig;
}());

exports.getTasks = getTasks;
exports.toSpaceCase = toSpaceCase;
exports.toCamelCase = toCamelCase;
exports.TaskConfig = TaskConfig;
exports.build = build$1;
