
const { clean, buildCopyPackageFile, rollupBuild, createRollupConfig } = require('@ngx-devtools/common');

const PKG_NAME = 'task';

const rollupConfig = createRollupConfig({
  input: `src/${PKG_NAME}.ts`,
  tsconfig: 'src/tsconfig.json',
  external: [ 
    '@ngx-devtools/common',
    '@ngx-devtools/build',
    '@ngx-devtools/server'
  ],
  output: {
    file: `dist/${PKG_NAME}.js`,
    format: 'cjs'
  }
})

clean('dist').then(() => {
  return Promise.all([ buildCopyPackageFile(PKG_NAME), rollupBuild(rollupConfig) ])
});