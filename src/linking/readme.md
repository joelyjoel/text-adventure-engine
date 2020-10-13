# text-adventure-engine/linking

This is an important part of the repository that serves as a bridge between the logic code and the language code. Between syntax and semantics. At the center we have a class called the `SyntaxLogicLinkingMatrix`. This class stores an indexed table mapping 'syntaxs' to 'meanings'. The `syntaxToMeaning` method finds the corresponding meaning for a given syntax, and the `meaningToSyntaxs` finds all syntaxs that correspond to the given meaning. A limitation is enforced that each syntax must resolve to just one meaning, but meanings may correspond to any number of syntaxs.

What is meant by syntax and meaning? In the current version a syntax is defined as either a noun, an adjective or a PredicateSyntax + tense. Meanwhile a meaning is simply a Predicate string with an attached truth value.

As with many other parts of this project, this code will need a major review and refactor thanks to the new `suggestSyntax()` function. This funciton, developed to solve a few problems with the older code, turns out to be much more powerful than all of the older code.

## Interpretation
