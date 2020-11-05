# Text Adventure Engine
A game engine for hosting multiplayer text adventure games online.

## Glossary
- **String**:
- **Parse** (as a verb):
- **Parse** (as a noun):
- **Conjugate**:
- **Deconjugate**:
- **Interpret**:
- **Entity**: Entities represent something in the world. Pretty much anything really, but usually the sort of thing that could be referred to using a noun-phrase. Entities are implemented as unique `string`s. (see `src/logic/basics.ts`)
- **Predicate**: It represents a type of sentence that can be made about some entities. Predicates are implemented as `string`s ending with `/x` where `x` is the number of arguments the predicate accepts.
- **Sentence**: A predicate in conjunction with an ordered list of entities (arguments).
- **Truth-Value**: A short string representing the true-ness of a statement. A truth-value may be any string, but by default three are used: `'T'`, `'F'` and `'?'`, representing true, false and unknown/indifferent respectively.
- **Statement**: A sentence with associated with a truth value.
- **Claim**: The `VariableTable` which contains variables to be substituted.
- **Standard**: The truth table which we are trying to map the _claim_ onto.
- **Complete Mapping** or simply **Mapping**: An ordered list of entities which correspond to an ordered list of variables for which they are to be substituted. `:Entity[]`
- **Partial Mapping:** A mapping except that a special symbol (`null`) can be used to indicate doubt/indifference about zero or more positions. `:(Entity|null)[]`.
- **Contradictory Mapping**: A mapping which results in one or more statements which contradict the standard.
- **Introductory Mapping**: A mapping which results in new statements which had _indifferent_ (`?`) truth values in the _standard_.
- **Imperfect Mapping**: A mapping which is _contradictory_, _introductory_ or both.
