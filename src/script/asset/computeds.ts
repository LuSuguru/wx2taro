/*
 * @Author: 芦杰
 * @Date: 2022-06-14 14:49:22
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-19 16:16:21
 * @Description: computed 的编译
 */

import * as t from '@babel/types'
import template from '@babel/template'
import traverse from '@babel/traverse'

import { Asset } from '../config'
import { addImportConfig } from '../../utils'

// computed: {
//   navigator(data) {
//       const { navigatorBtn, list } = data;
//       return list.filter(it => !!navigatorBtn[it.key]);
//   }
// }

// ========>

// const navigator = useMemo(() => {
//   const { navigatorBtn, list } = state;
//   return list.filter((it) => !!navigatorBtn[it.key]);
// }, [state.navigatorBtn, state.list]);

export default {
  shouldTransform: true,

  reset() {
    // 重置 transform 执行标记
    this.shouldTransform = true
  },

  parse(node, config, path) {
    // 判断 data 的数据属于 props 还是 state
    const getDep = (name: string) => {
      if (config.properties.has(name)) {
        return {
          type: 'props',
          dep: `props.${name}`
        }
      }
      return {
        type: 'state',
        dep: `state.${name}`
      }
    }

    node.properties.forEach((property: t.ObjectMethod) => {
      const key = (property.key as t.Identifier).name

      const deps: string[] = []

      // 获取 data 中的属性，加到依赖中
      path.traverse({
        Identifier: (path) => {
          const { node, parent } = path

          if (node.name !== 'data') {
            return
          }

          // data.xxx or  data?.xxx
          if (t.isMemberExpression(parent) || t.isOptionalMemberExpression(parent)) {
            const { type, dep } = getDep((parent.property as t.Identifier).name)
            deps.push(dep)
            node.name = type
          }

          // const { xxx } = data
          if (t.isVariableDeclarator(parent)) {
            (parent.id as t.ObjectPattern).properties.forEach(({ key }: t.ObjectProperty) => {
              const { type, dep } = getDep((key as t.Identifier).name)
              deps.push(dep)
              node.name = type
            })
          }

          path.skip()
        }
      })
      // 直接在初始化时声明函数的
      if (property.body) {
        config.computeds.set(key, { value: property.body, deps })
      }
      // TODO: 在此处使用变量声明函数的
    })

    // 增加 useMemo from 'react' 的依赖
    if (node.properties?.length) {
      const importPath = 'react'
      const importName = 'useMemo'

      addImportConfig(config.imports, importPath, importName)
    } else {
      // 不执行 transform
      this.shouldTransform = false
    }
  },

  transform(ast, { computeds }) {
    const nodes = [...computeds].map(([key, { value, deps }]) => {
      const memoFunBuild = template(`const ${key} = useMemo(()=>%%source%%,[${deps}])`)
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
