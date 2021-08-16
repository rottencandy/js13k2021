const glslxPlugin = require('esbuild-plugin-glslx');
require('esbuild').build({
  entryPoints: ['src/main.js', 'src/app.css'],
  bundle: true,
  watch: true,
  charset: 'utf8',
  target: 'es6',
  format: 'iife',
  outdir: 'app',
  plugins: [glslxPlugin()],
}).catch(() => process.exit(1))
