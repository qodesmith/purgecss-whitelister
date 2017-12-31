const listSelectors = require('list-css-selectors');
const cssWhat = require('css-what');
const glob = require('glob');

function makeWhitelist(filenames) {
  if (!Array.isArray(filenames)) filenames = [filenames];
  if (!filenames.length) throw 'You gave me an empty array. I feel so empty inside...';
  if (filenames.some(name => !name.split)) throw `Oops! Something passed wasn't a string.`;

  // If globs were passed, boil everything down to a flat array of absolute paths.
  filenames = flattenArray(filenames.map(name => glob.sync(name, { absolute: true })));
  if (!filenames.length) {
    console.log('\n\nNo matching files found for whitelisting.');
    console.log('Proceeding with an empty array.\n\n');
    return [];
  }

  const selectorErrors = [];
  const selectors = listSelectors(filenames);
  const whitelist = selectors.map(selector => {
    let name;

    try {
      const what = cssWhat(selector);
      name = what[0].map(obj => {
        if (obj.type.includes('pseudo')) return;
        if (obj.type === 'tag') return obj.name;
        return obj.value || obj.name;
      });
    } catch (e) {
      selectorErrors.push(selector);
    }

    return name && name.filter(Boolean);
  }).filter(Boolean);

  if (selectorErrors.length) {
    console.log('\n\nErrors with the following selectors:');
    selectorErrors.forEach(selector => console.log(`  ${selector}`));
    console.log('\n\n');
  }

  const flatWhitelist = flattenArray(whitelist);
  return Array.from(new Set(flatWhitelist)); // Remove duplicates.
}

function flattenArray(arr) {
  const isArray = Array.isArray(arr);
  if (!isArray) return arr;

  let finalArray = [];

  arr.forEach(thing => {
    if (isArray) {
      finalArray = finalArray.concat(flattenArray(thing));
    } else {
      finalArray.push(thing);
    }
  });

  return finalArray;
}

module.exports = makeWhitelist;
