import {wordnetParse} from './suggestSyntax';
import {evaluateTree} from './tree';
import {interpretSimplePresent} from './interpret';

async function * oneStepInterpretation(str:string) {
  const forest = await wordnetParse(str);

  for(let tree of forest.recursiveTrees()) {
    const evaluation = evaluateTree(tree);
    const interpretation = interpretSimplePresent(evaluation);

    yield interpretation;
  }
}

describe('Interpreting a sentences', () => {
  test.each([
    'the woman lives on the hill',
    'the hoover loves the orange melon',
    "the priest seduces the pope under a starry sky",
  ])('Interpretting "%s"', async str => {
    let numberOfIntepretations = 0;
    for await(let interpretation of oneStepInterpretation(str)) {
      numberOfIntepretations++;
      console.log(`"${str}"\n`, interpretation.symbol);
    }

    expect(numberOfIntepretations).toBeGreaterThanOrEqual(1);
  });

});
