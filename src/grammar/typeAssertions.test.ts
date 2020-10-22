import {Grammar} from './Grammar';
import {evaluateTree, Tree} from './Tree';
import {NounPhraseGrammar} from './NounPhraseGrammar'
import {VerbTenseGrammar} from './VerbTenseGrammar';
import {ExamplePOSGrammar} from './ExamplePOSGrammar';
import {PredicateSyntaxGrammar} from './PredicateSyntaxGrammar';

describe('Checking that grammar tree evaluations satisfy their type assertions', () => {
  describe.each([
    ['NounPhraseGrammar', Grammar.merge(NounPhraseGrammar, ExamplePOSGrammar)],
    ['VerbTenseGrammar', Grammar.merge(VerbTenseGrammar, ExamplePOSGrammar)],
    ['PredicateSyntaxGrammar', Grammar.merge(PredicateSyntaxGrammar, ExamplePOSGrammar)],
  ])("%s's tree evaluations satisfy its type assertions", (name:string, G:Grammar) => {

    G.checkRules();
    G.assertNoDuplicateRules();

    describe.each(Object.keys(G.typeAssertions))("Evaluating trees derived from '%s'", S => {
      const assertion = G.typeAssertions[S];
      let n = 0;
      for(let tree of G.recursiveTrees(S)) {
        if(n++ > 100)
          break;

        test(G.stringifyTree(tree), () => {
          const evaluation = evaluateTree(tree);
          expect(assertion(evaluation)).toBe(true);
        })
      }
    })
  });
});

test('Known bug: stack overflow substituting _AdjList', () => {
  expect(() => {
    return Grammar.merge(NounPhraseGrammar, ExamplePOSGrammar).recursiveTrees('_AdjList').next();
  }).not.toThrowError();
});

test.todo('typeAssertions are properly carried forward with Grammar.merge');
test.todo('typeAssertions are properly carried forward with Grammar.quick');
