const { createRollupConfig } = require('@ngx-devtools/common');

const getRollupConfig = (options = {}) => { 
  const PKG_NAME = 'task';
  const rollOptions = {
    input: `.tmp/${PKG_NAME}.ts`,
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
  }
  return createRollupConfig({ ...rollOptions, ...options });
}

exports.getRollupConfig = getRollupConfig;