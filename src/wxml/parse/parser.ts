/*
 * @Author: 芦杰
 * @Date: 2022-05-20 16:37:38
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-05-20 20:57:01
 * @Description: 语法分析
 */
import { Token, StackNode, Type } from './type'

interface State {
  tokens: Token[]
  cursor: number
  stack: StackNode[]
}

export function parse(state: State) {
  const { tokens, stack } = state
  const nodes = stack[stack.length - 1].children
  let { cursor } = state

  while (cursor < tokens.length) {
    const token = tokens[cursor]

    if (token.type !== Type.TagStart) {
      nodes.push(token)
      cursor++
      continue
    }
  }
}

export default function parser(tokens: Token[]) {
  const state: State = {
    tokens,
    cursor: 0,
    stack: [{
      tagName: '',
      children: []
    }]
  }

  parse(state)
  return tokens
}
