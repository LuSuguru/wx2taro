/*
 * @Author: 芦杰
 * @Date: 2022-06-08 16:44:33
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-08 20:48:43
 * @Description: data 的编译
 */

import t from '@babel/types'
import template from '@babel/template'
import traverse from '@babel/traverse'

import { Asset, Config } from '../config'

// data: {
//   list: [],
//   ICON_MAP:{},
//   navigatorBtn: []
// }

// ====>>>>

// const initialState = {
//   list: [],
//   ICON_MAP:{},
//   navigatorBtn: []
// }

// const [state,setState] = useStates(initialState)

export default class DataAsset implements Asset {
  static parse(node: t.ObjectExpression, config: Config) {
    node.properties.forEach((property: t.ObjectProperty) => {
      config.data.stateKeys.push((property.key as t.Identifier).name)
    })

    config.data.ast = node

    const importPath = '@yt/react-hooks'
    const importName = 'useStates'

    config.imports.set(importPath, [
      ...config.imports.get(importPath) || [],
      importName
    ])
  }

  static transform(ast: t.File, { data }: Config) {
    // 生成 state 的 AST
    const stateBuild = template('const [state, setState] = useStates(%%source%%)')
    const stateAST = stateBuild({
      source: data.ast
    }) as t.VariableDeclaration

    traverse(ast, {
      VariableDeclarator: ({ node }) => {
        // 找到页面组件的函数体
        if ((node.id as t.Identifier).name !== 'Page') return

        // 插入 定义 state 的语句
        ((node.init as t.ArrowFunctionExpression).body as t.BlockStatement).body.unshift(stateAST)
      }
    })
  }
}
