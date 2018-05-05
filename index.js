const listSelectors = require('list-css-selectors');
const sanitizeArgs = require('list-css-selectors/sanitizeArgs');
const flattenArray = require('list-css-selectors/flattenArray');
const cssWhat = require('css-what');
const attrs = ['equals', 'start', 'end', 'element', 'hyphen', 'any', 'not'];


/*
  This function parses css file(s) for their selectors,
  and massages those selectors into plain text words
  so that Purgecss can successfully whitelist them.

  Examples
  --------
  .some-class         => some-class
  #some-id            => some-id
  [an-attribute]      => an-attribute
  [data-test='hello'] => data-test, hello

  Arguments:
    * `filenames` - An array of strings representing file names
    * `list` - For testing purposes only, not officially part
               of the API. You can manually pass a list of selectors
               and avoid having `makeWhitelist` read file data.
*/
function makeWhitelist(filenames, list) {
  filenames = !list && sanitizeArgs(filenames);
  if (!filenames.length && !list) return [];

  const selectorErrors = [];
  const selectors = list || listSelectors(filenames);
  const whitelist = selectors.map(selector => {
    let what = [];

    try {
      what = cssWhat(selector);
    } catch(e) {
      selectorErrors.push({ selector, e });
    }

    return what.map(arr => extractNames(arr));
  });

  if (selectorErrors.length) {
    console.log(`\n\nErrors with the following selectors (${selectorErrors.length}):`);
    console.log('----------------------------------------');

    selectorErrors.forEach(({ selector, e }) => {
      console.log('Selector:', selector);
      console.log('Associated error:');
      console.log(e);
      console.log('');
      console.log('*** *** *** *** ***');
      console.log('');
    });
  }

  const flatWhitelist = flattenArray(whitelist);
  return Array.from(new Set(flatWhitelist)); // Remove duplicates.
}

/*
  Iterates through an array from the results of `cssWhat`
  and returns names without selector characters such as [., #, >], etc.

  https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
  List of psuedo selectors that can contain other selectors:
    * host
    * host-context
    * not
*/
function extractNames(arr) {
  const newArray = arr.map(({ type, name, value, action, data }) => {
    if (type === 'attribute') {
      // #id
      if (name === 'id') return value;

      // .class
      if (name === 'class') return value;

      // [attr]
      if (action === 'exists') return name;

      /*
        Example        Action
        -----------------------
        [attr=val]  | 'equals'
        [attr^=val] | 'start'
        [attr$=val] | 'end'
        [attr~=val] | 'element'
        [attr|=val] | 'hyphen'
        [attr*=val] | 'any'
        [attr!=val] | 'not'
      */
      if (attrs.includes(action)) return [name, value];
    }

    // tag
    if (type === 'tag') return name;

    // Pseudo stuffs - recursion!
    // Type might be 'pseudo' or 'pseudo-element'.
    if (type.includes('pseudo') && Array.isArray(data)) return data.map(arr => extractNames(arr));
  });

  return flattenArray(newArray).filter(Boolean);
}

module.exports = makeWhitelist;
