/*
 * @Author: 芦杰
 * @Date: 2022-06-08 15:32:53
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-14 14:45:36
 * @Description: 解析源代码 AST，生成 config
 */

import traverse, { NodePath } from '@babel/traverse'
import * as t from '@babel/types'

import { typeWhileList, ArgumentProp, Config, importBlackList } from '../config'
import * as Asset from '../asset'

export default function parse(ast: t.File, imports: Config['imports']) {
  const config: Config = {
    data: {
      ast: null,
      stateKeys: []
    },
    properties: new Map(),
    methods: new Map(),
    notConstructor: [],
    imports
  }

  traverse(ast, {
    CallExpression: (path) => {
      if (!typeWhileList.includes((path.node.callee as t.Identifier).name)) {
        return
      }

      // 找到 component ,page 的同级节点
      const notConstructorPath: NodePath<t.Node>[] = path.getStatementParent().getAllPrevSiblings()

      // getAllPrevSiblings 获取的是倒序
      for (let i = notConstructorPath.length - 1; i >= 0; i--) {
        const { node } = notConstructorPath[i]
        if (!t.isImportDeclaration(node)) {
          config.notConstructor.push(node)
          // import 如果在黑名单中，则保留，否则删除
        } else if (!importBlackList.includes(node.source.value)) {
          config.notConstructor.push(node)
        }
      }

      (path.node.arguments as t.ObjectExpression[])?.[0]?.properties.forEach((property: t.ObjectProperty) => {
        const key = property.key as t.Identifier
        const value = property.value as t.ObjectExpression

        switch (key.name) {
          case ArgumentProp.Data:
            Asset.data.parse(value, config)
            break
          case ArgumentProp.Properies:
            Asset.properies.parse(value, config)
            break
          case ArgumentProp.Methods:
            Asset.methods.parse(value, config)
            break
          default:
            break
        }
      })
    }
  })

  return config
}
