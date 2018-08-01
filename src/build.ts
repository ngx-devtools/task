import { isProcess, copyFileAsync, globFiles, mkdirp, clean, injectHtml } from '@ngx-devtools/common';
import { buildDevAll, buildDevElements, buildProdElements } from '@ngx-devtools/build';
import { join, dirname,  } from 'path';
import { existsSync } from 'fs';

const prodModeParams = [ '--prod',  '--prod=true',  '--prod true'  ];

const argv = require('yargs')
  .option('elements', { default: null, type: 'string' })
  .option('prod-elements', { default: null, type: 'string' })
  .option('prod-libs', { default: null, type: 'string' })
  .option('prod-app', { default: null, type: 'string' })
  .argv;

const ELEMENTS_PATH = join('src', 'elements');

async function copyAssets() {
  const ASSETS_PATH = 'src/assets', INDEX_HTML_PATH = 'src/index.html';
  const files = await globFiles(existsSync(ASSETS_PATH) ? [ `${ASSETS_PATH}/**/*`, INDEX_HTML_PATH ]: [ INDEX_HTML_PATH ]);
  return Promise.all(files.map(file => {
    const destPath = file.replace('src', 'dist');
    mkdirp(dirname(destPath));
    return copyFileAsync(file, destPath);
  }));
}

async function buildTask(){
  return (argv.prodElements !== null) 
    ? (argv.prodElements)
      ? buildProdElements({ src: ELEMENTS_PATH, packages: argv.prodElements.split('.')  })
      : buildProdElements({ src: ELEMENTS_PATH })
    : (argv.elements !== null)
      ? (argv.elements) 
        ? buildDevElements({ src: ELEMENTS_PATH, packages: argv.elements.split('.')  })
        : buildDevElements({ src: ELEMENTS_PATH })
    : buildDevAll()
}

async function buildProdTaskAll(){
  return Promise.all([ clean('dist'), clean('.tmp') ]).then(() => {
    return Promise.all([ 
      copyAssets().then(() => injectHtml('dist/index.html')), 
      buildProdElements({ src: ELEMENTS_PATH }) 
    ]);
  })
}

async function buildProdTask(){
  return (argv.elements !== null)
    ? (argv.elements) 
      ? buildProdElements({ src: ELEMENTS_PATH, packages: argv.elements.split('.')  })
      : buildProdElements({ src: ELEMENTS_PATH })
    : buildProdTaskAll()   
}

async function build() {
  return (isProcess(prodModeParams)) ? buildProdTask(): buildTask();
}

export { build, copyAssets }