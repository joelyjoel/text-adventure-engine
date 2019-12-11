export * from 'regops';

export function wholeWord(operand:RegExp|string) {
  let source = operand instanceof RegExp ?
    operand.source : operand;

  return new RegExp('(?<=\\s|^)(?:' + source + ")(?=\\s|$)", 'g')
}

export function g(operand:RegExp|string) {
  let source = operand instanceof RegExp ?
    operand.source : operand;

  return new RegExp(source, 'g');
}

export function initialAndWholeWord(operand: RegExp|string) {
  let source = operand instanceof RegExp ?
    operand.source : operand;

  return new RegExp(`^(?:${source})(?=\\s|$)`, 'g')
}