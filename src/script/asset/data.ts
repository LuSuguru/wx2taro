/*
 * @Author: 芦杰
 * @Date: 2022-06-08 16:44:33
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-19 16:16:30
 * @Description: data 的编译
 */

import t from '@babel/types'
import template from '@babel/template'
import traverse from '@babel/traverse'

import { Asset } from '../config'
import { addImportConfig } from '../../utils'

// data: {
//   list: [],
//   ICON_MAP:{},
//   navigatorBtn: []
// }

// ====>>>>

// const [state,setState] = useStates({
//   list: [],
//   ICON_MAP:{},
//   navigatorBtn: []
// })

export default {
  shouldTransform: true,

  reset() {
    // 重置 transform 执行标记
    this.shouldTransform = true
  },

  parse(node, config) {
    node.properties.forEach((property: t.ObjectProperty) => {
      config.data.stateKeys.push((property.key as t.Identifier).name)
    })

    config.data.ast = node

    // data 不为空时增加 useStates 引用
    if (config.data.stateKeys.length) {
      const importPath = '@yt/react-hooks'
      const importName = 'useStates'
      addImportConfig(config.imports, importPath, importName)
    } else {
      // 不执行 transform
      this.shouldTransform = false
    }
  },

  transform(ast, { data }) {
    // 生成 state 的 AST
    const stateBuild = template('const [state, setState] = useStates(%%source%%)')
    const stateAST = stateBuild({
      source: data.ast
    }) as t.VariableDeclaration

    // 解构生成的 state
    const stateDestructAst = template(`const {${data.stateKeys?.join(',')}} = state`)() as t.VariableDeclaration

    traverse(ast, {
      VariableDeclarator: ({ node }) => {
        // 找到页面组件的函数体
        if ((node.id as t.Identifier).name !== 'Page') return

        // 插入定义 state 的语句，以及解构语句
        ((node.init as t.ArrowFunctionExpression).body as t.BlockStatement).body.unshift(stateAST, stateDestructAst)
      }
    })
  }
} as Asset
