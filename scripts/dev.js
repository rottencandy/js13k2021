const glslxPlugin = require('@rottencandy/esbuild-plugin-glslx');
require('esbuild').build({
  entryPoints: ['src/main.js', 'src/app.css'],
  bundle: true,
  charset: 'utf8',
  target: 'es6',
  format: 'iife',
  outdir: 'app',
  watch: {
    onRebuild(error, result) {
      if (error) console.error('watch build failed:', error.errors)
      else console.log('watch build succeeded:', result)
    },
  },
  plugins: [glslxPlugin()],
}).catch(() => process.exit(1))
