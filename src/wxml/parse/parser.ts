/*
 * @Author: 芦杰
 * @Date: 2022-05-20 16:37:38
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-05-20 20:57:01
 * @Description: 语法分析
 */
import { Token, StackNode, Type, Position, ElementNode } from './type'

interface State {
  tokens: Token[]
  cursor: number
  stack: StackNode[]
}

function rewindStack(stack: StackNode[], newLength: number, childrenEndPosition?: Position, endPosition?: Position) {
  stack[newLength].position.end = endPosition

  for (let i = newLength + 1; i < stack.length; i++) {
    stack[i].position.end = childrenEndPosition
  }
  stack.splice(newLength)
}

export function parse(state: State) {
  const { tokens, stack } = state
  const nodes = stack[stack.length - 1].children
  let { cursor } = state

  while (cursor < tokens.length) {
    const token = tokens[cursor]

    if (token.type !== Type.TagStart) {
      nodes.push(token as any)
      cursor++
      continue
    }

    // 类型等于 Type.TagStart
    const tagToken = tokens[++cursor]
    cursor++

    const tagName = tagToken.content?.toLowerCase()

    if (token.close) {
      let index = stack.length - 1
      let shouldRewind = false

      for (index; index >= 0; index--) {
        if (stack[index].tagName === tagName) {
          shouldRewind = true
          break
        }
      }

      for (cursor; cursor < tokens.length; cursor++) {
        if (tokens[cursor].type !== Type.TagEnd) break
      }

      if (shouldRewind) {
        rewindStack(stack, index, token.position?.start, tokens[cursor - 1].position?.end)
        break
      } else {
        continue
      }
    }

    const attributes: string[] = []
    let attrToken

    for (cursor; cursor < tokens.length; cursor++) {
      attrToken = tokens[cursor]

      if (attrToken.type === Type.TagEnd) break

      attributes.push(attrToken.content || '')
    }

    cursor++

    const children = []
    const position = {
      start: token?.position?.start,
      end: attrToken?.position?.end
    }

    const elementNode: ElementNode = {
      type: Type.Element,
      tagName: tagToken.content,
      attributes,
      children,
      position
    }

    nodes.push(elementNode)

    if (!attrToken?.close) {
      const size = stack.push({ tagName, children, position })

      const innerState = { tokens, cursor, stack }
      parse(innerState);

      ({ cursor } = innerState)
      if (stack.length === size) {
        elementNode.position.end = tokens[cursor - 1]?.position?.end
      }
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
