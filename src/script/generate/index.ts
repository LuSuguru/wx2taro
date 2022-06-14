/*
 * @Author: 芦杰
 * @Date: 2022-06-08 16:19:42
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-14 14:32:03
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
  Asset.methods.transform(ast, config)

  const { notConstructor } = config

  // 插入非构造器的 Ast
  traverse(ast, {
    Program: ({ node }) => {
      node.body.unshift(...notConstructor as t.Statement[])
    }
  })

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
