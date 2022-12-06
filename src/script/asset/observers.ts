/*
 * @Author: 芦杰
 * @Date: 2022-06-22 16:01:29
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-19 16:27:14
 * @Description: observers 的解析
 */

import * as t from '@babel/types'
import template from '@babel/template'

import { addImportConfig } from '../../utils'
import { Asset } from '../config'
import MethodCompiler from './methods/MethodCompiler'

export default {
  shouldTransform: true,

  reset() {
    // 重置 transform 执行标记
    this.shouldTransform = true
  },

  parse(node, config) {
    node.properties.forEach((property: t.ObjectProperty) => {
      let key = ''
      // key 是字符串
      if (t.isStringLiteral(property.key)) {
        key = property.key.value
        // key 直接属性值
      } else if (t.isIdentifier(property.key)) {
        key = property.key.name
      }

      let fatherProp: 'state' | 'props' = 'state'
      if (config.properties.has(key)) {
        fatherProp = 'props'
      }

      // 获取参数名
      const func = property.value as t.FunctionExpression

      // 清空 obsever 的入参，然后在头部插入 let xxx = state.xxx
      const declaraions = t.variableDeclaration('let', func.params.map((param: t.Identifier) => {
        const paramName = param.name
        return {
          type: 'VariableDeclarator',
          id: t.identifier(paramName),
          init: t.memberExpression(t.identifier(fatherProp), t.identifier(key))
        }
      }))
      func.body.body.unshift(declaraions)
      func.params = []

      // 替换 observer 的参数为 state.xxx
      // path.traverse({
      //   Identifier: (path) => {
      //     const { node } = path

      //     if (node.name !== paramName) {
      //       return
      //     }
      //     path.replaceWith(t.memberExpression(
      //       t.identifier(fatherProp),
      //       t.identifier(key)
      //     ))
      //   }
      // })

      const { body } = property.value as t.FunctionExpression

      config.observers.set(key, {
        value: body as t.BlockStatement,
        fatherProp
      })

      const importName = 'useEffect'
      const importPath = 'react'

      addImportConfig(config.imports, importPath, importName)
    })

    // 没有 observers 不执行 transform
    this.shouldTransform = !!config.observers.size
  },

  transform(ast, config) {
    const { observers } = config

    const nodes = [...observers].map(([key, { value, fatherProp }]) => {
      const observerBuild = template(`useEffect(()=>%%body%%,[${fatherProp}['${key}']])`)
      return observerBuild({ body: value }) as t.ExpressionStatement
    })

    const methodCompiler = new MethodCompiler(config)

    methodCompiler.transform(ast, nodes)
  },
} as Asset
