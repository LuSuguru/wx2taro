/*
 * @Author: 芦杰
 * @Date: 2022-06-08 16:19:42
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-10 17:19:04
 * @Description: 将配置转换为目标代码 AST 的内容
 */

import traverse from '@babel/traverse'
import t from '@babel/types'

import { getCodeByAST, formatCode } from '../../utils/babel-utils'
import { Config } from '../config'
import * as Asset from '../asset'

export default function transform(ast: t.File, config: Config) {
  Asset.data.transform(ast, config)
  Asset.properies.transform(ast, config)

  const importCode = [...config.imports]
    .sort((a, b) => b[1].length - a[1].length)
    .reduce((pre, [path, modules]) => {
      if (modules.length) {
        return `${pre}import {${modules}} from '${path}'\n`
      }
      return `${pre}import '${path}'\n`
    }, '')

  const jsxCode = getCodeByAST(ast)

  return formatCode(`${importCode}\n${jsxCode}`)
}
