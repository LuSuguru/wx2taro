/*
 * @Author: 芦杰
 * @Date: 2022-05-20 16:36:54
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-05-27 15:05:42
 * @Description: 词法分析
 */

import { Position, Token, Type } from '../type'

export interface State {
  str: string
  tokens: Token[]
  position: Position
}

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

// 文本
export function lexText(state: State) {
  const { str, position, tokens } = state

  let textEnd = findTextEnd(str, position.index)

  // 当前是个 tag 或者 comment
  if (textEnd === position.index) return

  // 当前所有内容都是 text
  if (textEnd === -1) {
    textEnd = str.length
  }

  const start: Position = { ...position }
  const content = str.slice(position.index, textEnd)
  jumpPosition(position, str, textEnd)

  tokens.push({
    type: Type.Text,
    content,
    position: {
      start,
      end: { ...position }
    }
  })
}

// 注释
export function lexComment(state: State) {
  const { str, position, tokens } = state

  const start = { ...position }
  feedPosition(position, str, 4)

  let contendEnd = str.indexOf('-->', position.index)
  let commentEnd = contendEnd + 3
  if (contendEnd === -1) {
    contendEnd = str.length
    commentEnd = str.length
  }

  const content = str.slice(position.index, contendEnd)
  jumpPosition(position, str, commentEnd)

  tokens.push({
    type: Type.Comment,
    content,
    position: {
      start,
      end: { ...position }
    }
  })
}

export function lexTagName(state: State) {
  const { str, position, tokens } = state
  const { length } = str

  let start = position.index
  while (start < length) {
    const char = str.charAt(start)

    if (!(/\s/.test(char) || char === '/' || char === '>')) {
      break
    }
    start++
  }

  let end = start + 1
  while (end < length) {
    const char = str.charAt(end)

    if (/\s+/.test(char) || char === '/' || char === '>') {
      break
    }
    end++
  }

  jumpPosition(position, str, end)
  const tagName = str.slice(start, end)
  tokens.push({
    type: Type.Tag,
    content: tagName
  })
}

export function lexTagAttributes(state: State) {
  const { str, position, tokens } = state

  let cur = position.index
  let quote = null // 引号标识符
  let wordBegin = cur

  const words = [] // "key", "key=value", "key='value'"

  while (cur < str.length) {
    const char = str.charAt(cur)

    // 处理引号
    if (quote) {
      if (char === quote) {
        quote = null
      }
      cur++
      continue
    }

    // 处理结尾情况
    if (char === '/' || char === '>') {
      if (cur !== wordBegin) {
        words.push(str.slice(wordBegin, cur))
      }
      break
    }

    // 处理空格
    if (/\s/.test(char)) {
      if (cur !== wordBegin) {
        words.push(str.slice(wordBegin, cur))
      }
      wordBegin = cur + 1
      cur++
      continue
    }

    // 处理引号
    if (char === '\'' || char === '"') {
      quote = char
      cur++
      continue
    }

    cur++
  }

  jumpPosition(position, str, cur)

  const type = Type.Attribute

  for (let i = 0; i < words.length; i++) {
    const word = words[i]

    // 单词没有 =
    if (!word.includes('=')) {
      const secondWord = words[i + 1]
      if (secondWord && secondWord.startsWith('=')) {
        // key, ="value"
        if (secondWord.length > 1) {
          tokens.push({
            type,
            content: `${word}${secondWord}`
          })
          i++
          continue
        }

        const thirdWord = words[i + 2]
        i++
        // key,=,"value"
        if (thirdWord) {
          tokens.push({
            type,
            content: `${word}=${thirdWord}`
          })
          i++
          continue
        }
      }
    }

    // key=, xxx
    if (word.endsWith('=')) {
      const secondWord = words[i + 1]

      // key1, key2="value"
      if (secondWord && !secondWord.includes('=')) {
        tokens.push({
          type,
          content: `${word}${secondWord}`
        })
        i++
        continue
      }

      tokens.push({
        type,
        content: word.slice(0, -1)
      })
      continue
    }

    tokens.push({
      type,
      content: word
    })
  }
}

export function lexTag(state: State) {
  const { str, position, tokens } = state

  const start = { ...position }
  const isCloseStart = str.charAt(position.index + 1) === '/'
  feedPosition(position, str, isCloseStart ? 2 : 1)
  tokens.push({
    type: Type.TagStart,
    close: isCloseStart,
    position: {
      start
    }
  })

  lexTagName(state)
  lexTagAttributes(state)

  const isCloseEnd = str.charAt(position.index) === '/'
  feedPosition(position, str, isCloseEnd ? 2 : 1)
  tokens.push({
    type: Type.TagEnd,
    close: isCloseEnd,
    position: {
      end: { ...position }
    }
  })
}

export function lex(state: State) {
  const { str, position } = state

  while (position.index < str.length) {
    const start = position.index
    lexText(state)

    if (position.index === start) {
      if (str.substring(start, start + 4) === '<!--') {
        lexComment(state)
      } else {
        lexTag(state)
      }
    }
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
