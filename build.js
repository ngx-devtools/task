
const { clean, buildCopyPackageFile, rollupBuild, createRollupConfig, globFiles } = require('@ngx-devtools/common');

(async function(){
  const PKG_NAME = 'task';
  const files = await globFiles('src/**/*.ts');

  const rollupConfig = createRollupConfig({
    input: files,
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
})()