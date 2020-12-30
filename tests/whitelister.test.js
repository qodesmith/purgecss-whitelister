const path = require('path')
const whitelister = require('../index')

test('extracts selectors from a CSS file', () => {
  const list = whitelister(path.resolve(__dirname, 'test.css'))
  const expectedResults = [
    'class1',
    'class2',
    'class3',
    'data-nope',
    'data-test',
    'div',
    'id1',
    'id2',
    'id3',
    'span',
  ].sort()

  expect(list.sort()).toEqual(expectedResults.sort())
})

test('extracts selectors from a SCSS file', () => {
  const list = whitelister(path.resolve(__dirname, 'test.scss'))
  const expectedResults = [
    'div',
    'span',
    'test1',
    'test2',
    'test3',
    'test4'
  ].sort()

  expect(list.sort()).toEqual(expectedResults.sort())
})

test('extracts selectors from a LESS file', () => {
  const list = whitelister(path.resolve(__dirname, 'test.less'))
  const expectedResults = [
    'div',
    'span',
    'test1',
    'test2',
    'test3',
    'test4'
  ].sort()

  expect(list.sort()).toEqual(expectedResults.sort())
})
