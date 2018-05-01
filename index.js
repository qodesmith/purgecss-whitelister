const listSelectors = require('list-css-selectors');
const sanitizeArgs = require('list-css-selectors/sanitizeArgs');
const flattenArray = require('list-css-selectors/flattenArray');
const cssWhat = require('css-what');

function makeWhitelist(filenames) {
  filenames = sanitizeArgs(filenames);
  if (!filenames.length) return [];

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

module.exports = makeWhitelist;
