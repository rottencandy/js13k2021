## Build

### Install dependencies
```
yarn install
```

### Development mode:
(No minification, watch and rebuild when any file changes)
```
yarn dev
```

### Produciton build:
(Minified and bundled)
```
yarn build
```
Make another pass using [Uglify](https://github.com/mishoo/UglifyJS) on the resulting files:
```
yarn uglify
```

### Zip built files
(requires `zip` command)
```
yarn bundle
```

## Stuff used

[esbuild](https://github.com/evanw/esbuild) for minification & bundling
[glslx](https://github.com/evanw/glslx) for compiling, minifying webGL shaders
[Soundbox](https://github.com/mbitsnbites/soundbox/) for audio
