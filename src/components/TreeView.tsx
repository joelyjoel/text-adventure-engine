import * as React from 'react';
import {FunctionComponent} from 'react';
import {Tree} from '../grammar'

// @ts-ignore
import styled from 'styled-components';
import {isHiddenDefault} from '../grammar';

export interface TreeViewProps {
  tree: Tree<string>;
  isHidden?: (sym:any) => boolean;
  showHiddenBranches?: boolean;
}

export const TreeView: FunctionComponent<TreeViewProps> = ({
  tree,
  isHidden = isHiddenDefault,
  showHiddenBranches = false,
}) => {
  if(!showHiddenBranches && isHidden(tree.head))
    switch(tree.ruleKind) {
      case 'terminal':
        return <HiddenBracket label={tree.head}>{tree.body}</HiddenBracket>

      case 'nonTerminal':
        return <HiddenBracket label={tree.head}>
          <TreeView tree={tree.body[0]} showHiddenBranches={showHiddenBranches}/>
          <TreeView tree={tree.body[1]} showHiddenBranches={showHiddenBranches}/>
        </HiddenBracket>

      case 'alias':
        return <HiddenBracket label={tree.head}>
          <TreeView tree={tree.body} showHiddenBranches={showHiddenBranches} />
        </HiddenBracket>

      default:
        // @ts-ignore
        throw `Unexpected rule kind: ${tree.ruleKind}`;
    }

  else
    switch(tree.ruleKind) {
      case 'terminal':
        return <Bracket label={tree.head}>{tree.body}</Bracket>

      case 'nonTerminal':
        return <Bracket label={tree.head}>
          <TreeView tree={tree.body[0]} showHiddenBranches={showHiddenBranches}/>
          <TreeView tree={tree.body[1]} showHiddenBranches={showHiddenBranches}/>
        </Bracket>

      case 'alias':
        return <Bracket label={tree.head}>
          <TreeView tree={tree.body} showHiddenBranches={showHiddenBranches}/>
        </Bracket>

      default:
        // @ts-ignore
        throw `Unexpected rule kind: ${tree.ruleKind}`;
    }
};


const BracketSpan = styled.span`
  display: inline-block;
  border: 1px solid black;
  padding:3px;
  padding-top: 10px;
  margin: 3px;
  position: relative;

  >label {
    position: absolute;
    top:0px;
    left:0px;
    background-color:white;
    font-size: 50%;
  }
`

const HiddenBracket = styled.span`
  display: inline-block;
  margin-right: 3px;
  maring-left: 3px;
`

export interface BracketProps {
  label: string;
}
export const Bracket: FunctionComponent<BracketProps> = ({label, children}) => {
  return <BracketSpan>
    <label className='bracket_label'>{label}</label>
    <span className='bracket_content'>{children}</span>
  </BracketSpan>
};
