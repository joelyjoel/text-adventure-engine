import {Grammar, TerminalRule, NonTerminalRule, AliasRule, GrammarConstructorOptions} from './Grammar';

/** Parse a one-line grammar rule */
export function parseRule(line:string) {
  const [head, rh, ...extra] = line.split(/\s*->\s*/);

  if(head == undefined || rh == undefined || extra.length)
    throw `Grammar rule syntax error: "${line}"`;
  if(Grammar.isTerminal(head))
    throw `Left-hand-side of grammar rule must be a non-terminal symbol. i.e begin with an underscore (_).\nOffending line\n\t"${line}"`

  const bodies = rh.split(/\s*[;\|]\s*/)
    .map(body => body.trim())
    .filter(body => body.length)
    .map(body => body.split(' '))
  return {head, bodies};
}

export function expandRule(
  head: string, 
  body:string[], 
  F?: (...args:any[]) => any,
) {
  const defaultTerminalFunction = (terminal:string) => terminal;
  const defaultNTFunction = (...args:any[]) => [...args];

  if(body.length == 0)
    throw "Cannot expand rule with empty body";
  if(body.some(word => word.length==0)) {
    throw "Cannot expand rule with empty words in its body";
  }

  if(body.length == 1) {
    // SINGLE LENGTH BODY
    if(Grammar.isTerminal(body[0]))
      // Rules is a simple 1-1 terminal rule
      return {
        terminalRules: [{
          head, 
          body: body[0], 
          F: () => (F || defaultTerminalFunction)(body[0]),
        }],
        nonTerminalRules: [], aliasRules: [],
      };
    else
      return {
        nonTerminalRules: [],
        terminalRules: [],
        aliasRules: [{
          head, 
          body:body[0], 
          F: (nonTerminalReturnValue: any) => (F || defaultNTFunction)(nonTerminalReturnValue),
        }],
      }


  } else if(body.length > 1) {
    const nonTerminalRules:NonTerminalRule<string>[] = [];
    const terminalRules:TerminalRule<string>[] = [];

    const ntBody = body.map(S => {
      if(Grammar.isTerminal(S)) {
        let head = Grammar.createUniqueNonTerminal();
        terminalRules.push({head, body: S, F: () => []});
        return head;
      } else
        return S;
    })

    if(body.length > 2) {
      const skip = (a:any, b:any[]) => b;
      const prepend = (a:any, b:any[]) => [a, ...b];

      // TOP MOST NON TERMINAL
      let R = Grammar.createUniqueNonTerminal();
      nonTerminalRules.push({
        head,
        body: [ntBody[0], R],
        F: (a:any, accumulation:any[]) => {
          if(ntBody[0] == body[0])
            // User provided the non-terminal
            return (F || defaultNTFunction)(a, ...accumulation);
          else
            return (F || defaultNTFunction)(...accumulation);
        }
      })

      for(let i=1; i<ntBody.length - 2; ++i) {
        let remainder = Grammar.createUniqueNonTerminal();
        nonTerminalRules.push({
          head: R,
          body: [ntBody[i], remainder],
          F: ntBody[i] != body[i] ? skip : prepend,
        });
        R = remainder;
      }

      // BOTTOM MOST NON-TERMINAL RULE
      nonTerminalRules.push({
        head: R,
        body: ntBody.slice(-2) as [string, string], // Bit risky..
        F: (A:any, B:any) => {
          const AWasTerminal = body[body.length - 2] != ntBody[body.length-2];
          const BWasTerminal = body[body.length - 1] != ntBody[body.length-1];

          return [
            ...(AWasTerminal ? [] : [A]),
            ...(BWasTerminal ? [] : [B])
          ]
        },
      });
    } else
      // BODY HAS LENGTH 2
      nonTerminalRules.push({
        head,
        body: ntBody as [string, string],
        F: (A:any, B:any) => (F || defaultNTFunction)(
          ...(body[0] != ntBody[0] ? [] : [A]),
          ...(body[1] != ntBody[1] ? [] : [B]),
        ),
      })
    return {nonTerminalRules, terminalRules, aliasRules: []};
  } else
    throw "Cannot expand rule with empty body";
}

/** Quickly create a grammar from source code string. */
export function expandSource(src:string) {
  const lines = src.split('\n')
    .map(line => line.trim()) // Remove white space
    .filter(line => line.length) // Remove blank lines
    .filter(line => !/^\s*(#|\/\/)/.test(line)) // remove comments

  const terminalRules:TerminalRule<string>[] = [];
  const nonTerminalRules:NonTerminalRule<string>[] = [];
  const aliasRules:AliasRule<string>[] = [];

  for(let line of lines) {
    const {head, bodies} = parseRule(line);

    for(let body of bodies) {
      const expanded = expandRule(head, body);
      terminalRules.push(...expanded.terminalRules);
      nonTerminalRules.push(...expanded.nonTerminalRules);
      aliasRules.push(...expanded.aliasRules);
    }
  }

  return {
    terminalRules, 
    nonTerminalRules, 
    aliasRules,
  };
}


export interface RuleFunctionMapping {
  [ruleSource:string]: (...args: any[]) => any;
}

export function expandRuleFunctionMapping(src:RuleFunctionMapping) {
  const terminalRules:TerminalRule<string>[] = [];
  const nonTerminalRules:NonTerminalRule<string>[] = [];
  const aliasRules:AliasRule<string>[] = [];

  for(let rule in src) {
    const F = src[rule];
    const {head, bodies} = parseRule(rule);
    for(let body of bodies) {
      const expanded = expandRule(head, body, F);
      terminalRules.push(...expanded.terminalRules);
      nonTerminalRules.push(...expanded.nonTerminalRules);
      aliasRules.push(...expanded.aliasRules);
    }
  }

  return {terminalRules, nonTerminalRules, aliasRules};
}

export function quickGrammar(...sources:(string|RuleFunctionMapping|Grammar<string>)[]): GrammarConstructorOptions<string> {
  const terminalRules:TerminalRule<string>[] = [],
    nonTerminalRules:NonTerminalRule<string>[] = [],
    aliasRules:AliasRule<string>[] = [];

  for(let src of sources) {
    if(typeof src == 'string') {
      const expanded = expandSource(src);
      terminalRules.push(...expanded.terminalRules);
      nonTerminalRules.push(...expanded.nonTerminalRules);
      aliasRules.push(...expanded.aliasRules);
    } else if(src instanceof Grammar) {
      terminalRules.push(...src.terminalRules);
      nonTerminalRules.push(...src.nonTerminalRules);
      aliasRules.push(...src.aliasRules);
    } else {
      const expanded = expandRuleFunctionMapping(src);
      terminalRules.push(...expanded.terminalRules);
      nonTerminalRules.push(...expanded.nonTerminalRules);
      aliasRules.push(...expanded.aliasRules);
    }
  }

  return {
    terminalRules,
    nonTerminalRules,
    aliasRules,
    compareSymbol: Object.is,
    isTerminalSymbol: (o:any):o is string => typeof o == 'string' && !/^_/.test(o),
    isNonTerminalSymbol: (o:any):o is string => typeof o ==  'string' && /^_/.test(o),
    pleaseBeQuiet: true,
  };
}
