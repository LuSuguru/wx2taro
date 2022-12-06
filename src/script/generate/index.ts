/*
 * @Author: 芦杰
 * @Date: 2022-06-08 16:19:42
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-29 17:36:52
 * @Description: 将配置转换为目标代码 AST 的内容
 */

import traverse from '@babel/traverse'
import * as t from '@babel/types'

import { getCodeByAST, formatCode } from '../../utils/babel-utils'
import { Config, Type } from '../config'
import transformComponent from './transformComponent'
import transformPage from './transformPage'

export default function transform(ast: t.File, config: Config) {
  switch (config.type) {
    case Type.Component:
    case Type.ComponentWithComputed:
      transformComponent(ast, config)
      break
    case Type.Page:
      transformPage(ast, config)
      break
  }

  const { notConstructor } = config

  // 增加 import 代码
  const importAast = [...config.imports]
    .sort((a, b) => b[1].size - a[1].size)
    .reduce((pre, [path, modules]) => {
      // 获得 import 语句中的引用数据
      const specifiers: t.ImportDeclaration['specifiers'] = [];
      [...modules].forEach((item) => {
        if (typeof item === 'string') {
          specifiers.push(t.importSpecifier(t.identifier(item), t.identifier(item)))
        } else {
          specifiers.unshift(t.importDefaultSpecifier(t.identifier(item.name)))
        }
      })

      return [
        ...pre,
        t.importDeclaration(specifiers, t.stringLiteral(path))
      ]
    }, [] as t.ImportDeclaration[])

  // 插入非构造器的 Ast
  traverse(ast, {
    Program: ({ node }) => {
      node.body.unshift(...importAast, ...notConstructor as t.Statement[])
    }
  })

  const jsxCode = getCodeByAST(ast)

  return formatCode(jsxCode)
}
