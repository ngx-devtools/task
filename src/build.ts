import { isProcess } from '@ngx-devtools/common';
import { buildAll } from '@ngx-devtools/build';

const prodModeParams = [ '--prod',  '--prod=true',  '--prod true'  ];

const argv = require('yargs')
  .option('pkg', { default: null, type: 'string' })
  .argv;

async function build() {
  return (isProcess(prodModeParams)) 
    ? Promise.resolve()
    : buildAll()
}

export { build }