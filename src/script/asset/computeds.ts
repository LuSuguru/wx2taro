/*
 * @Author: 芦杰
 * @Date: 2022-06-14 14:49:22
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-14 17:10:01
 * @Description: computed 的编译
 */

import * as t from '@babel/types'
import template from '@babel/template'
import traverse from '@babel/traverse'

import { Asset } from '../config'

export default {
  parse(node, config, path) {
    node.properties.forEach((property: t.ObjectMethod) => {
      const key = (property.key as t.Identifier).name

      const deps: string[] = []
      path.traverse({
        Identifier: (path) => {
          const { node, parent } = path

          if (node.name !== 'data') {
            return
          }

          if (t.isMemberExpression(parent)) {
            deps.push((parent.property as t.Identifier).name)
          }

          if (t.isOptionalMemberExpression(parent)) {
            deps.push((parent.property as t.Identifier).name)
          }

          if (t.isVariableDeclarator(parent)) {
            (parent.id as t.ObjectPattern).properties.forEach(({ key }: t.ObjectProperty) => {
              deps.push((key as t.Identifier).name)
            })
          }
          node.name = 'state'
          path.skip()
        }
      })
      config.computeds.set(key, { value: property.body, deps })
    })

    // 增加 useMemo from 'react' 的依赖
    if (node.properties?.length) {
      const importPath = 'react'
      const importName = 'useMemo'
      config.imports.set(importPath, [
        ...config.imports.get(importPath) || [],
        importName
      ])
    }
  },

  transform(ast, { computeds }) {
    const nodes = [...computeds].map(([key, { value, deps }]) => {
      const memoFunBuild = template(`const ${key} = useMemo(()=>%%source%%,[${deps.map(dep => `state.${dep}`)}])`)
      const memoFunAST = memoFunBuild({
        source: value
      })
      return memoFunAST as t.VariableDeclaration
    })

    traverse(ast, {
      ReturnStatement: (path) => {
        if (t.isJSXElement(path.get('argument'))) {
          path.insertBefore(nodes)
        }
        path.skip()
      }
    })
  }
} as Asset
