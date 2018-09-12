import { join } from 'path';
import { buildProdElements, buildDevElements } from '@ngx-devtools/build';

const ELEMENTS_PATH = join('src', 'elements');

async function bundleProdElements({ prodElements, elements }) {
  return (prodElements !== null) 
    ? (prodElements)
      ? buildProdElements({ src: ELEMENTS_PATH, packages: prodElements.split('.')  })
      : buildProdElements({ src: ELEMENTS_PATH })
    : (elements !== null)
      ? (elements) 
        ? buildDevElements({ src: ELEMENTS_PATH, packages: elements.split('.')  })
        : buildDevElements({ src: ELEMENTS_PATH })  
    : Promise.resolve()
}

export { bundleProdElements }