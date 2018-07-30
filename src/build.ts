import { isProcess, copyFileAsync, globFiles, mkdirp } from '@ngx-devtools/common';
import { buildDevAll, buildDevElements, buildProdElements } from '@ngx-devtools/build';
import { join, dirname,  } from 'path';

const prodModeParams = [ '--prod',  '--prod=true',  '--prod true'  ];

const argv = require('yargs')
  .option('elements', { default: null, type: 'string' })
  .option('prod-elements', { default: null, type: 'string' })
  .option('prod-libs', { default: null, type: 'string' })
  .option('prod-app', { default: null, type: 'string' })
  .argv;

const ELEMENTS_PATH = join('src', 'elements');

async function copyAssets() {
  const files = await globFiles(['src/assets/**/*', 'src/index.html']);
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

async function buildProdTask(){
  return (argv.elements !== null)
    ? (argv.elements) 
      ? buildProdElements({ src: ELEMENTS_PATH, packages: argv.elements.split('.')  })
      : buildProdElements({ src: ELEMENTS_PATH })
    : Promise.all([ copyAssets(), buildProdElements({ src: ELEMENTS_PATH }) ])
}

async function build() {
  return (isProcess(prodModeParams)) ? buildProdTask(): buildTask();
}

export { build, copyAssets }