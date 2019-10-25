import { join, dirname, basename } from 'path';
import { existsSync } from 'fs';

import { Devtools, getStyleContent, stripSpaces, urlResolver, writeFileAsync, mkdirp, globFiles, copyFileAsync, readFileAsync } from '@ngx-devtools/common';
import { buildProdComponents } from '@ngx-devtools/build';

const DEST_PATH = 'dist';
const SRC_PATH = 'src';
const ASSETS_PATH = join(SRC_PATH, 'assets');
const DEFAULT_FAVICON = join(SRC_PATH, 'favicon.ico');

const HTML_FILE = join(SRC_PATH, 'index.html');
const DEST_HTML_FILE = join(DEST_PATH, 'index.html');

async function createStyles() {
  const styles: string[] = (Devtools.config.build && Devtools.config.build['styles']) ? Devtools.config.build.styles: [];
  const contents = styles.map(style => getStyleContent(style, urlResolver)).join(' ')
  mkdirp(DEST_PATH)
  return writeFileAsync(join(process.env.APP_ROOT_PATH, DEST_PATH, 'styles.css'), stripSpaces(contents))
}

async function copyAssets() {
  const files = await globFiles(join(ASSETS_PATH, '**/*'))
  return Promise.all(files.map(file => {
    const destPath = file.replace('src', 'dist');
    mkdirp(dirname(destPath));
    return copyFileAsync(file, destPath);
  }))
}

async function copyFavicon(favicon: string) {
  mkdirp(DEST_PATH);
  const fileSrc = join(process.env.APP_ROOT_PATH, favicon);
  const destPath = join(DEST_PATH, basename(favicon));
  return copyFileAsync(fileSrc, destPath);
}

async function copyHTMLFile() {
  mkdirp(DEST_PATH);
  return copyFileAsync(HTML_FILE, DEST_HTML_FILE);  
}

async function appendToHTML() {
  let htmlContent: string = await readFileAsync(DEST_HTML_FILE, 'utf8');
  if (existsSync(join(process.env.APP_ROOT_PATH, DEST_PATH, 'styles.css'))) {
    htmlContent = htmlContent.replace('<!-- styles -->', `<link rel="stylesheet" href="styles.css" />`)
  }
  if (existsSync(join(process.env.APP_ROOT_PATH, DEST_PATH, 'favicon.ico'))) {
    htmlContent = htmlContent.replace('<!-- favicon -->', `<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />`)
  }
  htmlContent = htmlContent.replace('<!-- title -->', (Devtools.config.title) ? Devtools.config.title: '');
  htmlContent = htmlContent.replace('<!-- livereload -->', '');
  return writeFileAsync(DEST_HTML_FILE, htmlContent);
}

async function bundleProdComponents({ assets }) {
  return Promise.all([
    buildProdComponents(Object.keys(Devtools.config.build.prod)),
    (async function() {
      return (assets !== null || assets) 
        ? Promise.all([
            createStyles(),
            (async function() {
              return (existsSync(ASSETS_PATH))  
                ? copyAssets()
                : Promise.resolve()
            })(),   
            (async function() {
              return (existsSync(DEFAULT_FAVICON)) 
                ? copyFavicon(DEFAULT_FAVICON)
                : (Devtools.config.favicon) 
                  ? existsSync(join(process.env.APP_ROOT_PATH, Devtools.config.favicon)) 
                    ? copyFavicon(Devtools.config['favicon']): Promise.resolve()
                  : Promise.resolve()
            })(),
            copyHTMLFile()         
          ]) 
        : Promise.resolve()
    })()
  ])
  .then(() => {
    return existsSync(join(process.env.APP_ROOT_PATH, DEST_HTML_FILE)) 
      ? appendToHTML()
      : Promise.resolve()
  })
}

export { createStyles, bundleProdComponents }