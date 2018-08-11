
const { createRollupConfig, ngxBuild } = require('@ngx-devtools/common');

(async function(){
  const PKG_NAME = 'task';
  const ENTRY_FILE = `.tmp/${PKG_NAME}.ts`;

  const rollupConfig = createRollupConfig({
    input: ENTRY_FILE,
    tsconfig: '.tmp/tsconfig.json',
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

  await ngxBuild(PKG_NAME, rollupConfig)
})()