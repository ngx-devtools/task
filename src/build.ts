import { join, dirname,  } from 'path';
import { existsSync } from 'fs';

import { Devtools } from '@ngx-devtools/common';
import { bundleProdElements } from './build-prod-elements';
import { bundleProdLibs } from './build-prod-libs';

import { 
  isProcess, 
  copyFileAsync, 
  globFiles, 
  mkdirp, 
  clean, 
  injectHtml 
} from '@ngx-devtools/common';

import { 
  ngCompileProdApp, 
  ngCompilePackageLibs,
  buildDevAll, 
  buildProdElements, 
  buildProdLibs, 
  buildProdApp
} from '@ngx-devtools/build';

const prodModeParams = [ '--prod',  '--prod=true',  '--prod true'  ];

const argv = require('yargs')
  .option('elements', { default: null, type: 'string' })
  .option('prod-elements', { default: null, type: 'string' })
  .option('prod-libs', { default: null, type: 'string' })
  .option('prod-app', { default: null, type: 'string' })
  .option('ngc-libs', { default: null, type: 'string' })
  .option('ngc-app', { default: null, type: 'string' })
  .option('config', { default: null, type: 'string' })
  .argv;

const ELEMENTS_PATH = join('src', 'elements');
const LIBS_PATH = join('src', 'libs');
const HTML_PATH = join('dist', 'index.html');

async function copyAssets() {
  const ASSETS_PATH = 'src/assets', INDEX_HTML_PATH = 'src/index.html';
  const files = await globFiles(existsSync(ASSETS_PATH) ? [ `${ASSETS_PATH}/**/*`, INDEX_HTML_PATH ]: [ INDEX_HTML_PATH ]);
  return Promise.all(files.map(file => {
    const destPath = file.replace('src', 'dist');
    mkdirp(dirname(destPath));
    return copyFileAsync(file, destPath);
  }));
}

async function buildTask() {
  return (argv.prodElements !== null) 
    ? bundleProdElements(argv)
    : (argv.prodLibs !== null) ? bundleProdLibs(argv): buildDevAll()
}

async function buildProdTaskAll() {
  return Promise.all([ clean('dist'), clean('.tmp') ]).then(() => {
    return Promise.all([ 
      copyAssets().then(() => injectHtml(HTML_PATH)), 
      buildProdLibs({ src: LIBS_PATH }),
      buildProdApp(),
      buildProdElements({ src: ELEMENTS_PATH })
    ]);
  })
}

async function buildProdTask() {
  return (argv.elements !== null)
    ? (argv.elements) 
      ? buildProdElements({ src: ELEMENTS_PATH, packages: argv.elements.split('.')  })
      : buildProdElements({ src: ELEMENTS_PATH })
    : (argv.ngcLibs !== null) 
      ? (argv.ngcLibs) 
        ? ngCompilePackageLibs({ src: LIBS_PATH, packages: argv.ngcLibs.split('.') })
        : ngCompilePackageLibs({ src: LIBS_PATH })
      : (argv.ngcApp !== null || argv.ngcApp)
        ? ngCompileProdApp()
        : buildProdTaskAll()   
}

async function build() {
  return (isProcess(prodModeParams)) ? buildProdTask(): buildTask();
}

export { build, copyAssets }