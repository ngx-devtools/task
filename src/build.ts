import { isProcess } from '@ngx-devtools/common';
import { buildDevAll, buildDevElements, buildProdElements } from '@ngx-devtools/build';
import { join } from 'path';

const prodModeParams = [ '--prod',  '--prod=true',  '--prod true'  ];

const argv = require('yargs')
  .option('elements', { default: null, type: 'string' })
  .argv;

const ELEMENTS_PATH = join('src', 'elements');

async function buildDevElementsArgv(){
  return (argv.elements) 
    ? buildDevElements({ src: ELEMENTS_PATH, packages: argv.elements.split('.')  })
    : buildDevElements({ src: ELEMENTS_PATH });
}

async function buildDevTask(){
  return (argv.elements !== null) ? buildDevElementsArgv(): buildDevAll()
}

async function buildProdTask(){
  return (argv.elements !== null) 
    ? (argv.elements)
      ? buildProdElements({ src: ELEMENTS_PATH, packages: argv.elements.split('.')  })
      : buildProdElements({ src: ELEMENTS_PATH })
    : Promise.resolve()
}

async function build() {
  return (isProcess(prodModeParams)) ? buildProdTask(): buildDevTask();
}

export { build }