/*
 * @Author: 芦杰
 * @Date: 2022-06-08 15:32:53
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-15 15:34:36
 * @Description: 解析源代码 AST，生成 config
 */

import traverse from '@babel/traverse'
import * as t from '@babel/types'

import { Type, typeWhileList, Config, importBlackList } from '../config'
import parseComponent from './parseComponent'
import parsePage from './parsePage'

export default function parse(ast: t.File, imports: Config['imports']) {
  const config: Config = {
    type: null,
    data: {
      ast: null,
      stateKeys: []
    },
    properties: new Map(),
    methods: new Map(),
    computeds: new Map(),
    lifetimes: new Map(),
    observers: new Map(),
    pageMethods: new Map(),
    notConstructor: [],
    imports
  }

  traverse(ast, {
    Program: (path) => {
      path.node.body.forEach((node) => {
        if (t.isExpressionStatement(node)) {
          const { expression } = node
          if (t.isCallExpression(expression) && t.isIdentifier(expression.callee)) {
            if (typeWhileList.includes(expression.callee.name as Type)) {
              return
            }
          }
        } else if (t.isImportDeclaration(node)) {
          // import 如果在黑名单中，则删除，否则保留
          if (!importBlackList.includes(node.source.value)) {
            config.notConstructor.push(node)
          }
        } else {
          config.notConstructor.push(node)
        }
      })
    },
    CallExpression: (path) => {
      const type = (path.node.callee as t.Identifier).name as Type
      if (!typeWhileList.includes(type)) {
        return
      }

      config.type = type

      // 小程序的格式，无论是 Page,Component，参数都是一个对象
      if (path.node.arguments.length !== 1) return

      const argument = path.node.arguments[0]

      // 参数不是对象，则不解析
      if (!t.isObjectExpression(argument)) return

      switch (type) {
        case Type.Component:
        case Type.ComponentWithComputed:
          parseComponent(argument.properties, config, path.get('arguments.0.properties') as any,)
          break
        case Type.Page:
          parsePage(argument.properties, config)
          break
      }
    }
  })

  return config
}
