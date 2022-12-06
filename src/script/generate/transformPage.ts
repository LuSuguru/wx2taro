/*
 * @Author: 芦杰
 * @Date: 2022-06-27 16:51:36
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-18 15:53:18
 * @Description: page 的转换
 */

import * as t from '@babel/types'
import template from '@babel/template'

import { Config } from '../config'
import * as Asset from '../asset'
import MethodCompiler from '../asset/methods/MethodCompiler'

export default function transformPage(ast: t.File, config: Config) {
  if (Asset.data.shouldTransform) {
    Asset.data.transform(ast, config)
  }

  const nodes = [...config.pageMethods].map(([key, { value, needTaroApi }]) => {
    // 获取函数体和函数参数
    const { params, body, async } = value

    const paramNames = []
    params.forEach((param) => {
      if (t.isIdentifier(param)) {
        paramNames.push(param.name)
      }
    })

    // 对象函数形式
    // onLoad() {
    //   getFp(this, wx.getStorageSync('userId') || '');
    // }

    // ===>

    // useLoad(() => {
    //   getFp(this, wx.getStorageSync('userId') || '');
    // })
    if (needTaroApi) {
      const nodeBuild = template(`${key}((${paramNames})=>%%body%%)`)

      return nodeBuild({ body }) as t.Statement
    }

    const funBlockAST = t.arrowFunctionExpression(params, body, async)

    const methodBuild = template(`const ${key} = usePersistFn(%%funBlockAST%%)`)
    return methodBuild({ funBlockAST }) as t.VariableDeclaration
  })

  const methodCompiler = new MethodCompiler(config)
  methodCompiler.transform(ast, nodes)
}
