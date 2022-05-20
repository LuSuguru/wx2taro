/*
 * @Author: 芦杰
 * @Date: 2022-05-20 16:28:12
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-05-20 16:38:56
 * @Description: 入口
 */

import lexer from './lexer'
import parser from './parser'

export function parse(str: string) {
  const tokens = lexer(str)
  const nodes = parser(tokens)

  return nodes
}
