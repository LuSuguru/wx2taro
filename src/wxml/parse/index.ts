/*
 * @Author: 芦杰
 * @Date: 2022-05-20 16:28:12
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-05-26 17:02:33
 * @Description: 入口
 */
import Path from 'path'
import fse from 'fs-extra'

import lexer from './lexer'
import parser from './parser'
import format from './format'

export default function parse(str: string) {
  const tokens = lexer(str)
  const nodes = parser(tokens)

  fse.writeFileSync(Path.join(process.cwd(), './build/token.json'), JSON.stringify(tokens, null, 2))
  fse.writeFileSync(Path.join(process.cwd(), './build/nodes.json'), JSON.stringify(nodes, null, 2))

  return format(nodes)
}
