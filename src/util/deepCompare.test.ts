import {deepCompare, deepMatch} from './deepCompare';

describe('Testing deepCompare function for consistency', () => {
  // Should return `true`
  test.each([
    [0, 0],
    [69, 69],
    ['hello', 'hello'],
    [null, null],
    [undefined, undefined],
    [{a:5}, {a:5}],
    [{a:5, b:6}, {b:6, a:5}],
    [[1,2,3], [1,2,3]],
    [
      { article: 'the', adjectives: [ 'red' ], noun: 'truck', plural: false },
      { article: 'the', adjectives: [ 'red' ], noun: 'truck', plural: false }
    ],
  ])('%o = %o', (a:any, b:any) => {
    expect(deepCompare(a, b)).toBe(true);
    expect(deepCompare(b, a)).toBe(true);
  });

  // Should return `false`
  test.each([
    [7, 6],
    [1, 0.999],
    ['hello', 'goodbye'],
    [{a: 5}, {b:5}],
    [undefined, null],
    [undefined, 0],
  ])('%o != %o', (a:any, b:any) => {
    expect(deepCompare(a, b)).toBe(false);
    expect(deepCompare(b, a)).toBe(false);
  });
})

describe("Testing deepMatch function", () => {
  // Should return `true`
  describe('Positive tests', () => {
    test.each([
      [0, 0],
      [69, 69],
      ['hello', 'hello'],
      [null, null],
      [undefined, undefined],
      [{a:5}, {a:5}],
      [{a:5, b:6}, {b:6, a:5}],
      [[1,2,3], [1,2,3]],
      [
        { article: 'the', adjectives: [ 'red' ], noun: 'truck', plural: false },
        { article: 'the', adjectives: [ 'red' ], noun: 'truck', plural: false }
      ],
      [{a: 5}, {a:5, b:6}],
    ])('%o matches %o', (a:any, b:any) => {
      expect(deepMatch(a, b)).toBe(true);
    })
  });

  // Should return `false`
  describe('Negative tests', () => {
    test.each([
      [7, 6],
      [1, 0.999],
      ['hello', 'goodbye'],
      [{a: 5}, {b:5}],
      [undefined, null],
      [undefined, 0],
      [{a: 5, b: 6}, {a: 5}],
    ])("%o doesn't match %o", (a:any, b:any) => {
      expect(deepMatch(a, b)).toBe(false);
    });
  });
});
