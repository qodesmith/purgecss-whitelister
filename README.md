```

/\ \  __/\ \/\ \      __/\ \__       /\_ \   __        /\ \__
\ \ \/\ \ \ \ \ \___ /\_\ \ ,_\    __\//\ \ /\_\    ___\ \ ,_\ By: Qodesmith
 \ \ \ \ \ \ \ \  _ `\/\ \ \ \/  /'__`\\ \ \\/\ \  /',__\ \ \/  /'__`\/\`'__\
  \ \ \_/ \_\ \ \ \ \ \ \ \ \ \_/\  __/ \_\ \\ \ \/\__, `\ \ \_/\  __/\ \ \/
   \ `\___x___/\ \_\ \_\ \_\ \__\ \____\/\____\ \_\/\____/\ \__\ \____\\ \_\
    '\/__//__/  \/_/\/_/\/_/\/__/\/____/\/____/\/_/\/___/  \/__/\/____/ \/_/

```

# Purgecss Whitelister

Dynamically create lists of selectors for PurgeCSS to ignore (i.e. _not purge_)! Supports css, sass, and less. Use this to safely include libraries such as bootstrap and others.


## Why this package?

While rebuilding my personal site in React and using webpack + [purgecss-webpack-plugin](https://github.com/FullHuman/purgecss-webpack-plugin), I noticed that my 3rd party library, [Typer.js](https://github.com/qodesmith/typer) (it's really cool - it types things out on the screen like a typewriter), had its styles stripped from the bundle. While it wasn't _that_ big a deal to type out the few class names into the `safelist` array, what if that list was huge? What if it was _yuuuge_? I needed a way to dynamically generate a list of selectors. Boom. `purgecss-whitelister` was born.


## Installation

Via [npm](https://www.npmjs.com/package/purgecss-whitelister):

```bash
npm i purgecss-whitelister
```


## Usage

`purgecss-whitelister` is meant to extract all the selectors used in a file and create an array of names to safeguard PurgeCSS from purging. ***Works with css, sass, and less!*** This is very handy when you have a 3rd party library that you don't want annihilated from your bundle.

Pass either a string, a globby string, or an array of either, representing the location(s) of the file(s) that contain selectors you want to keep.

**NOTE:** `purgecss-whitelister` will internally ignore any files that don't have the following extensions: `css`, `sass`, `scss`, `less`, or `pcss`.

**NOTE:** Use the `pcss` extension with caution. It may or may not work. `pcss` is a PostCSS file extension but has no official documentation. It's been added to this tool for convenience but YMMV. If anyone has info on the `pcss` extension, I'm all ears.

```javascript
const whitelister = require('purgecss-whitelister')

// Example 1 - simple string
whitelister('./relative/path/to/my/styles.css')

// Example 2 - array of strings
whitelister(['./styles1.css', './styles2.scss'])

// Example 3 - globby strings
whitelister('./3rd/party/library/*.less')

// Example 4 - array of globby strings
whitelister([
  './node_modules/lib1/*.css',
  './node_modules/lib2/*.scss',
  './node_modules/lib3/*.less'
])

// Example 5 - ALL THE THINGS
//
whitelister('./node_modules/cool-library/styles/*.*')
```

## Webpack Example

```javascript
const whitelister = require('purgecss-whitelister')
const PurgecssPlugin = require('purgecss-webpack-plugin')

const webpackConfig = {

  // ...a whole buncha stuffs up here...

  plugins: [
    new PurgecssPlugin({
      // ...other PurgeCSS options...
      safelist: whitelister('node_modules/typer-js/typer.css'),
    }),

    // ...probably more plugins & things...
  ]
}
```
