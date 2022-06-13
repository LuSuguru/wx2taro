/*
 * @Author: 芦杰
 * @Date: 2022-06-13 11:32:31
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-13 18:09:39
 * @Description: methods 的解析
 */

import * as t from '@babel/types'
import { Asset } from '../config'
import traverse from '@babel/traverse'

export default {
  parse(node, config) {
    node.properties.forEach((property: t.ObjectMethod) => {
      const key = (property.key as t.Identifier).name

      config.methods.set(key, { value: property })
    })
  },

  // TODO: 更多 的 API 需要处理
  transform(ast, { methods }) {
    const nodes = [...methods].map(([key, { value }]) => {
      const { async, params, body } = value

      const funBlockAST = t.arrowFunctionExpression(params, body, async)

      return t.variableDeclaration(
        'const',
        [t.variableDeclarator(
          t.identifier(key),
          funBlockAST
        )]
      )
    })

    traverse(ast, {
      ReturnStatement: (path) => {
        if (t.isJSXElement(path.get('argument'))) {
          path.insertBefore(nodes)
        }
      },
      ThisExpression: (path) => {
        const fatherNode = path.parent as t.MemberExpression
        const fatherPath = path.parentPath

        switch ((fatherNode.property as t.Identifier).name) {
          case 'data':
            fatherPath.replaceWith(t.identifier('state'))
            break
          case 'setData':
            fatherPath.replaceWith(t.identifier('setState'))
            break
          default:
            fatherPath.replaceWith(fatherNode.property)
            break
        }
      }
    })
  }
} as Asset
