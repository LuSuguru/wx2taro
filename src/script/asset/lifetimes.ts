/*
 * @Author: 芦杰
 * @Date: 2022-06-15 18:25:02
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-19 16:16:42
 * @Description: lifetimes 的编译
 */
import * as t from '@babel/types'
import template from '@babel/template'

import { addImportConfig } from '../../utils'
import { Asset } from '../config'
import MethodCompiler from './methods/MethodCompiler'

enum LifeTimes {
  Attached = 'attached',
  Detached = 'detached',
  Ready = 'ready'
}

// lifetimes: {
//   attached() {
//       this.queryNavigator();
//   }
// }

// ========>

// useMount(() => {
//   queryNavigator()
// })

export default {
  shouldTransform: true,

  reset() {
    // 重置 transform 执行标记
    this.shouldTransform = true
  },

  parse(node, config) {
    node.properties.forEach((property: t.ObjectMethod) => {
      const key = (property.key as t.Identifier).name

      config.lifetimes.set(key, { value: property.body })

      let importPath = ''
      let importName = ''
      switch (key) {
        case LifeTimes.Attached:
          importPath = '@yt/react-hooks'
          importName = 'useMount'
          break
        case LifeTimes.Detached:
          importPath = 'react'
          importName = 'useEffect'
          break
        default:
          break
      }

      addImportConfig(config.imports, importPath, importName)
    })
    this.shouldTransform = !!config.methods.size
  },

  transform(ast, config) {
    const { lifetimes } = config

    const nodes = []

    for (const [key, { value }] of lifetimes) {
      switch (key) {
        case LifeTimes.Attached: {
          const lifetimeBuild = template('useMount(()=>%%body%%)')

          nodes.push(lifetimeBuild({ body: value }) as t.ExpressionStatement)
          break
        }
        case LifeTimes.Ready: {
          const lifetimeBuild = template('useMount(()=>%%body%%)')

          nodes.push(lifetimeBuild({ body: value }) as t.ExpressionStatement)
          break
        }
        case LifeTimes.Detached: {
          const lifetimeBuild = template('useEffect(()=>()=>%%body%%,[])')

          nodes.push(lifetimeBuild({ body: value }) as t.ExpressionStatement)
          break
        }
      }
    }

    const methodCompiler = new MethodCompiler(config)
    methodCompiler.transform(ast, nodes)
  }

} as Asset
