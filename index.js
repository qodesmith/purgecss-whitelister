const listSelectors = require('list-css-selectors');
const sanitizeArgs = require('list-css-selectors/sanitizeArgs');
const flattenArray = require('list-css-selectors/flattenArray');
const cssWhat = require('css-what');
const glob = require('glob');


/*
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
  const selectors = list || listSelectors(filenames) || [];
  const whitelist = selectors.map(selector => {
    let names;

    try {
      const what = cssWhat(selector);
      names = extractNames(what[0])
    } catch (e) {
      selectorErrors.push(selector);
    }

    return names || [];
  });

  if (selectorErrors.length) {
    console.log(`\n\nErrors with the following selectors (${selectorErrors.length}):`);
    selectorErrors.forEach(selector => console.log(`  ${selector}`));
    console.log('\n\n');
  }

  const flatWhitelist = flattenArray(whitelist);
  return Array.from(new Set(flatWhitelist)); // Remove duplicates.
}

/*
  Iterates through an array from the results of `cssWhat`
  and returns names without selector characters such as [., #, >], etc.
*/
function extractNames(arr) {
  const newArray = arr.map(obj => {
    if (obj.type.includes('pseudo') && obj.data && obj.data.length) return extractNames(obj.data[0]);
    if (obj.type === 'tag') return obj.name;
    return obj.value || obj.name;
  }).filter(Boolean);

  return flattenArray(newArray);
}

module.exports = makeWhitelist;
