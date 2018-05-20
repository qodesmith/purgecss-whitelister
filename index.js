// const { parse } = require('scss-parser') // https://github.com/salesforce-ux/scss-parser
const { parse } = require('gonzales-pe')
const { readFileSync } = require('fs')
const globAll = require('glob-all')

const shouldParse = ['ruleset', 'selector', 'block']
const shouldKeep = ['id', 'class', 'attribute', 'typeSelector']
const exts = ['css', 'sass', 'scss', 'less']

function makeWhitelist(filenames) {
  filenames = sanitizeArgs(filenames)
  if (!filenames.length) return []

  // Create a deep array, each level containing a list of selectors.
  const deepArray = filenames.reduce((acc, filename) => {
    // Do nothing for non-style files.
    const ext = filename.split('.').pop()
    if (!exts.includes(ext)) return acc

    const fileContents = readFileSync(filename, 'utf-8')
    const parsed = parse(fileContents, { syntax: ext }).content
    const nodes = []
    parsed.traverse(node => {
      if (shouldKeep.includes(node.type)) {
        const thing = node.content.find(({ type }) => type === 'ident')
        nodes.push(thing)
      }
    })

    // const selectors = parseStyleAST(parsedData)
    // return acc.concat(selectors)
  }, [])

  // Flatten the array.
  const flattenedArray = flattenArray(deepArray)

  // Return an array of unique selectors in alphabetical order.
  return [...new Set(flattenedArray)].sort()
}

function sanitizeArgs(arr) {
  if (!Array.isArray(arr)) arr = [arr]
  arr = arr.filter(Boolean)

  // Avoids errors if an empty array, no arguments, or falsey things are passed.
  if (!arr.length) {
    console.log('\n\nNo items for processing. Moving right along...\n\n')
    return []
  }

  // Each thing in the array must be a string.
  if (arr.some(s => typeof s !== 'string')) throw `Oops! Something passed wasn't a string.`

  // Ensure absolute paths for filenames, especially if globs were passed.
  arr = globAll.sync(arr, { absolute: true })

  // If, at the end of it all, we have nothing, leave empty-handed.
  if (!arr.length) {
    console.log('\n\nNo matching files found.\n\n')
    return []
  }

  return arr
}

function parseStyleAST(arr) {
  return arr.reduce((acc, { type, content }) => {

    // Trigger recursion for types that need it.
    if (shouldParse.includes(type)) {
      return acc.concat(parseStyleAST(content))

    // Iterate through a type's values to extract selectors.
    } else if (shouldKeep.includes(type)) {
      return content
        .reduce((acc, { type, content }) => {
          return (type === 'ident' && !!content) ?  acc.concat(content) : acc
        }, acc)

    // Concatenate a type's value if no iteration is needed.
    } else if (type === 'identifier' && !!content) {
      return acc.concat(content)

    // No matches - acc is unchanged.
    // This allows us to skip filtering out falsy's later.
    } else {
      return acc
    }
  }, [])
}

function flattenArray(arr) {
  if (!Array.isArray(arr)) return arr

  return arr.reduce((acc, thing) => {
    return Array.isArray(thing) ? acc.concat(flattenArray(thing)) : acc.concat(thing)
  }, [])
}

module.exports = makeWhitelist
