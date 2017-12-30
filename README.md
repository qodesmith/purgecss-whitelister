```
/\ \  __/\ \/\ \      __/\ \__       /\_ \   __        /\ \__
\ \ \/\ \ \ \ \ \___ /\_\ \ ,_\    __\//\ \ /\_\    ___\ \ ,_\ By: Qodesmith
 \ \ \ \ \ \ \ \  _ `\/\ \ \ \/  /'__`\\ \ \\/\ \  /',__\ \ \/  /'__`\/\`'__\
  \ \ \_/ \_\ \ \ \ \ \ \ \ \ \_/\  __/ \_\ \\ \ \/\__, `\ \ \_/\  __/\ \ \/
   \ `\___x___/\ \_\ \_\ \_\ \__\ \____\/\____\ \_\/\____/\ \__\ \____\\ \_\
    '\/__//__/  \/_/\/_/\/_/\/__/\/____/\/____/\/_/\/___/  \/__/\/____/ \/_/
```

# Purgecss Whitelister

Create whitelists dynamically to include your 3rd party library styles!


## Why this package?

While rebuilding my [personal site](http://aaroncordova.xyz) in React and using webpack + [purgecss-webpack-plugin](https://github.com/FullHuman/purgecss-webpack-plugin), I noticed that my 3rd party library, [Typer.js](https://github.com/qodesmith/typer) (it's really cool - it types things out on the screen like a typewriter), had its styles stripped from the bundle. While it wasn't _that_ big a deal to type out the few class names into a whitelist array, what if that list was huge? What if it was _yuuuge_? I needed a way to dynamically generate a whitelist of selectors. Boom. `purgecss-whitelister` was born.


## Installation

Via [npm](https://www.npmjs.com/package/purgecss-whitelister):

```bash
npm i purgecss-whitelister
```


## Usage

`purgecss-whitelister` is meant to extract all the selectors used in a CSS file and create an array of names for whitelisting. This is very handy when you have a 3rd party library that you don't want annihilated from your bundle.

Pass either a string, a globby string, or an array of either, representing the location(s) of the CSS file(s) you want to completely whitelist. Try using `path.resolve` if things are blowing up:

```javascript
const { resolve } = require('path');
const whitelister = require('purgecss-whitelister');

// Example 1 - simple string
whitelister('./relative/path/to/my/styles.css');

/* ^ That's good, this is better */
const stylesPath = resolve(resolve(), './relative/path/to/my/styles.css');
whitelister(stylesPath);


// Example 2 - array of strings
const locations = ['./styles1.css', './styles2.css'];
whitelister(locations);

/* ^ Ahem, path.resolve plz */
const pathyLocations = locations.map(loc => resolve(resolve(), loc));
whitelister(pathyLocations);


// Example 3 - globby strings (or an array of them, your choice)
const globbyPath = resolve(resolve(), './3rd/party/library/*.css');
whitelister(globbyPath);
```

## Webpack Example

This is essentially what I'm using in my `webpack.config.js` file:
```javascript
const whitelister = require(purgecss-whitelister);
const PurgecssPlugin = require('purgecss-webpack-plugin');
const glob = require('glob-all')
const { resolve } = require('path');

const whitelist = whitelister(resolve(resolve(), 'node_modules/typer-js/typer.css'));

const webpackConfig = {

  // ...a whole buncha stuffs up here...

  plugins: [
    new PurgecssPlugin({
      keyframes: false, // https://goo.gl/bACbDW
      styleExtensions: ['.css'],
      paths: glob.sync([
        resolve(resolve(), 'src/**/*.js'),
        resolve(resolve(), 'src/index.ejs')
      ]),

      // `whiltelist` needed to ensure Typer classes stay in the bundle.
      whitelist: whitelist,
      extractors: [
        {
          // https://goo.gl/hr6mdb
          extractor: class AvoidBacktickIssue {
            static extract(content) {
              return content.match(/[A-Za-z0-9_-]+/g) || [];
            }
          },
          extensions: ['js'] // file extensions
        }
      ]
    }),

    // ...probably more plugins & things...
  ]
}
```
