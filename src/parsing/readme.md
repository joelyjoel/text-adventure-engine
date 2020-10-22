# text-adventure-engine/parsing

This was the section of the repo dedicated to extractive information out of NL strings, but I suspect it is mostly redundant now - superceded by the Grammar class. Like with many of the other READMEs, I'm writing this to make sense this old code in order to refactor/delete much of it.

It would be nice to keep some of this code and make the return types (NounPhraseParse, PredicateSyntaxParse) etc, consistent with the grammar tree-evaluations.

## Return types

### Parse
The base type for all Parse return-types.

### NounPhraseParse
Conjuction of all noun-phrase parse types: SimpleNounPhraseParse, PredicateSyntaxParse, ProperNounParse, PronounParse.

### SimpleNounPhraseParse
A parse of a 'simple' noun phrase. This is a noun phrase in the form of article + adjectives + noun.


### ProperNounParse
### PronounParse
### IdentifierParse
### NounParse
### Adjective Parse
### PredicateSyntaxParse
