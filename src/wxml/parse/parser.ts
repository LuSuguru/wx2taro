/*
 * @Author: 芦杰
 * @Date: 2022-05-20 16:37:38
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-14 15:10:59
 * @Description: 语法分析
 */
import { Token, StackNode, Type, Position, ElementNode } from '../type'

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

    // token 一定是 tag-start 类型
    // 根据 html 语法
    // tag-start 后面必定是 tag 类型的 token，处理 type === Type.Tag
    const tagToken = tokens[++cursor]
    cursor++

    const tagName = tagToken.content

    // 当前是个闭合的标签 token
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
        rewindStack(stack, index, token.position.start, tokens[cursor - 1].position.end)
        break
      } else {
        continue
      }
    }

    // 根据 html 语法，tag 后直到标签闭合（token-end）之间一定都是属性（attribute） 的 token
    // 处理标签内的属性，type === Type.Attrubite
    const attributes: string[] = []
    let attrToken: Token

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

    // 标签未关闭，说明有子内容
    if (!attrToken?.close) {
      const size = stack.push({ tagName, children, position })

      const innerState = { tokens, cursor, stack }
      parse(innerState)
      cursor = innerState.cursor

      // 说明当前整个标签已完整处理完，更新 position
      if (stack.length === size) {
        elementNode.position.end = tokens[innerState.cursor - 1]?.position?.end
      }
    }
  }
  state.cursor = cursor
}

export default function parser(tokens: Token[]) {
  // debugger
  const root: State['stack'][0] = {
    tagName: '',
    children: []
  }

  const state: State = {
    tokens,
    cursor: 0,
    stack: [root]
  }

  parse(state)
  return root.children
}
