/*
 * @Author: 芦杰
 * @Date: 2022-06-10 14:52:23
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-19 16:17:10
 * @Description: properies 的编译
 */

import * as t from '@babel/types'
import template from '@babel/template'
import { Asset } from '../config'
import traverse from '@babel/traverse'

// properties: {
//   props: {
//     type: Object,
//       value: { }
//   },
//   options: {
//     type: Object,
//       value: { }
//   }
// }

// ====>

// const { props = {}, value = {} } = props

export default {
  shouldTransform: true,

  reset() {
    // 重置 transform 执行标记
    this.shouldTransform = true
  },

  parse(node, config) {
    node.properties.forEach((property: t.ObjectProperty) => {
      let value = null

      if (t.isObjectExpression(property.value)) {
        // 遍历 properites 里面的属性，type,value,observer
        property.value.properties.forEach((property: t.ObjectProperty) => {
          // 解析 value
          if ((property.key as t.Identifier).name === 'value') {
            value = property.value
          }
        })
      }

      config.properties.set((property.key as t.Identifier).name, { value })
    })

    // 没有 properties 时不执行 transform
    this.shouldTransform = !!config.properties.size
  },

  transform(ast, { properties }) {
    const propValueAstMap = {}
    // 生成 props 的解构字符串模板
    const propTemplate = [...properties].reduce((pre, [key, { value }]) => {
      if (value) {
        propValueAstMap[key] = value
        return `${pre}${key}=%%${key}%%,`
      }
      return `${pre}${key},`
    }, '')

    const propBuild = template(`const {${propTemplate}} = props`)
    const propAST = propBuild(propValueAstMap) as t.VariableDeclaration

    traverse(ast, {
      VariableDeclarator: ({ node }) => {
        // 找到页面组件的函数体
        if ((node.id as t.Identifier).name !== 'Page') return

        // 插入定义 state 的语句
        ((node.init as t.ArrowFunctionExpression).body as t.BlockStatement).body.unshift(propAST)
      }
    })
  }
} as Asset
