/*
 * @Author: 芦杰
 * @Date: 2022-06-08 15:32:53
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-13 16:52:57
 * @Description: 解析源代码 AST，生成 config
 */

import traverse from '@babel/traverse'
import t from '@babel/types'

import { typeWhileList, ArgumentProp, Config } from '../config'
import * as Asset from '../asset'

export default function parse(ast: t.File, imports: Config['imports']) {
  const config: Config = {
    data: {
      ast: null,
      stateKeys: []
    },
    properties: new Map(),
    methods: new Map(),
    imports
  }

  traverse(ast, {
    CallExpression: ({ node }) => {
      if (!typeWhileList.includes((node.callee as t.Identifier).name)) {
        return
      }

      (node.arguments as t.ObjectExpression[])?.[0]?.properties.forEach((property: t.ObjectProperty) => {
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
