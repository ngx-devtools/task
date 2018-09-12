import { join } from 'path';

import { Devtools } from '@ngx-devtools/common';
import { buildProdLibs } from '@ngx-devtools/build';

const LIBS_PATH = join('src', 'libs');

async function bundleProdLibs({ prodLibs, config }) {
  return (prodLibs !== null)
    ? (config) 
      ? buildProdLibs({ 
          src: LIBS_PATH, 
          packages: (Devtools.config.build && Devtools.config.build['prod'] && Devtools.config.build.prod[config]) 
            ? Devtools.config.build.prod[config]: []
        })      
      : (prodLibs) 
        ? buildProdLibs({ src: LIBS_PATH, packages: prodLibs.split('.') })
        : buildProdLibs({ src: LIBS_PATH })
    : Promise.resolve()
}

export { bundleProdLibs }