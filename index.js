const listSelectors = require('list-css-selectors');
const sanitizeArgs = require('list-css-selectors/sanitizeArgs');
const flattenArray = require('list-css-selectors/flattenArray');
const cssWhat = require('css-what');
const glob = require('glob');

function makeWhitelist(filenames) {
  filenames = sanitizeArgs(filenames);
  if (!filenames.length) return [];

  const selectorErrors = [];
  const selectors = listSelectors(filenames);
  const whitelist = [];

  selectors.map(selector => {
    try {
      cssWhat(selector).map(what => {
        what.map(obj => {
          if (obj.type.includes('pseudo')) return;
          else if (obj.type === 'tag') whitelist.push(obj.name);
          else if (obj.value) whitelist.push(obj.value);
          else whitelist.push(obj.name);
        });
      });
    } catch (e) {
      selectorErrors.push(selector);
    }
  });

  if (selectorErrors.length) {
    console.log('\n\nErrors with the following selectors:');
    selectorErrors.forEach(selector => console.log(`  ${selector}`));
    console.log('\n\n');
  }

  const flatWhitelist = flattenArray(whitelist);
  return Array.from(new Set(flatWhitelist)); // Remove duplicates.
}

module.exports = makeWhitelist;
