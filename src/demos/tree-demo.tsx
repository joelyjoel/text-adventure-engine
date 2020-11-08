import * as React from 'react';
import ReactDOM from 'react-dom';
import {Tree} from '../grammar';
import {TreeView} from '../components/TreeView';
import {Grammar} from '../grammar';

const G = Grammar.quick(`
  _np -> your breath; my heartbeat; kevin
  _sentence -> focus on _np
  _sentence -> _np is listening to _np
`);

const exampleTrees:Tree<string>[] = [
  ...G.recursiveTrees(),
]

const exampleTreeViews = exampleTrees.map(tree => <TreeView tree={tree} showHiddenBranches={false} />);

window.onload = () => {
  const el = document.createElement('div');
  document.body.appendChild(el);

  ReactDOM.render(
    <div>{
      exampleTreeViews
    }</div>,
    el,
  );
}
