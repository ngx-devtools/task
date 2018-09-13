import { Devtools, getStyleContent, stripSpaces, urlResolver, writeFileAsync, mkdirp } from '@ngx-devtools/common';
import { buildProdComponents } from '@ngx-devtools/build';
import { join } from 'path';

async function createStyles() {
  const destPath = 'dist';
  const styles: string[] = (Devtools.config.build && Devtools.config.build['styles']) ? Devtools.config.build.styles: [];
  const contents = styles.map(style => getStyleContent(style, urlResolver)).join(' ')
  mkdirp(destPath)
  return writeFileAsync(join(process.env.APP_ROOT_PATH, destPath, 'styles.css'), stripSpaces(contents))
}

async function bundleProdComponents({ styles }) {
  return Promise.all([
    buildProdComponents(Object.keys(Devtools.config.build.prod)),
    (styles !== null || styles) ? createStyles(): Promise.resolve()
  ])
}

export { createStyles, bundleProdComponents }