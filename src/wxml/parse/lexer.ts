/*
 * @Author: 芦杰
 * @Date: 2022-05-20 16:36:54
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-05-20 17:38:45
 * @Description: 词法分析
 */

import { Position, State, Type } from './type'

export function feedPosition(position: Position, str: string, len: number) {
  const start = position.index
  position.index = start + len

  for (let i = start; i < position.index; i++) {
    if (str.charAt(i) === '\n') { // 有换行符
      position.line++
      position.column = 0
    } else { // 无行信息
      position.column++
    }
  }
}

export function jumpPosition(position: Position, str: string, end: number) {
  const len = end - position.index
  return feedPosition(position, str, len)
}

export function initialPostion(): Position {
  return {
    index: 0,
    column: 0,
    line: 0
  }
}

export function findTextEnd(str: string, index: number) {
  while (true) {
    const textEnd = str.indexOf('<', index)
    if (textEnd === -1) {
      return textEnd
    }

    const char = str.charAt(textEnd + 1)
    if (char === '/' || char === '!' || /[A-Za-z0-9]/.test(char)) {
      return textEnd
    }
    index = textEnd + 1
  }
}

export function lexText(state: State) {
  const { str, position } = state

  let textEnd = findTextEnd(str, position.index)

  // 当前是个 tag
  if (textEnd === position.index) return

  // 当前所有内容都是 text
  if (textEnd === -1) {
    textEnd = str.length
  }

  const start: Position = { ...position }
  const content = str.slice(position.index, textEnd)
  jumpPosition(position, str, textEnd)
  const end: Position = { ...position }

  state.tokens.push({
    type: Type.Text,
    content,
    position: {
      start, end
    }
  })
}

export function lex(state: State) {
  const { str, position } = state
  const { length } = str

  while (position.index < length) {
    const start = position.index
    lexText(state)
  }
}

export default function lexer(str: string) {
  const state: State = {
    str,
    tokens: [],
    position: initialPostion()
  }

  lex(state)
  return state.tokens
}
