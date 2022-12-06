/*
 * @Author: 芦杰
 * @Date: 2022-06-13 11:32:31
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-19 16:16:04
 * @Description: methods 的解析
 */

import * as t from '@babel/types'
import template from '@babel/template'

import { addImportConfig } from '../../../utils'
import { Asset } from '../../config'
import MethodCompiler from './MethodCompiler'

// async queryNavigator() {
//   let { orderId, tradeId, itemLineId, flashGoBatchRefund } = this.data.options;
//   const params = {
//       tradeId,
//       orderId,
//       itemLineId,
//       flashGoBatchRefund
//   };
//   const res = await action.getNavigator(params);

//   this.setData({
//       navigatorBtn: handleBtnData(res.data.navigator)
//   });
// }

// ====>>>>

// const queryNavigator = async () => {
//   let { orderId, tradeId, itemLineId, flashGoBatchRefund } = state.options;
//   const params = {
//       tradeId,
//       orderId,
//       itemLineId,
//       flashGoBatchRefund,
//   };
//   const res = await action.getNavigator(params);
//   setState({
//       navigatorBtn: handleBtnData(res.data.navigator),
//   });
// };

export default {
  shouldTransform: true,

  reset() {
    // 重置 transform 执行标记
    this.shouldTransform = true
  },

  parse(node, config) {
    node.properties.forEach((property: t.ObjectMethod) => {
      const key = (property.key as t.Identifier).name

      config.methods.set(key, { value: property })

      addImportConfig(config.imports, '@yt/react-hooks', 'usePersistFn')
    })
    // 如果没有方法，则不执行 transform
    this.shouldTransform = !!config.methods.size
  },

  // TODO: 更多 的 API 需要处理
  transform(ast, config) {
    const { methods } = config

    const nodes = []
    for (const [key, { value }] of methods) {
      let async = false
      let params = []
      let body = null

      if (t.isObjectMethod(value)) {
        ({ async, params, body } = value)
      } else if (t.isObjectProperty(value)) {
        if (t.isFunctionExpression(value.value)) {
          ({ async, params, body } = value.value)
        }
        continue
      }

      const funBlockAST = t.arrowFunctionExpression(params, body, async)

      const methodBuild = template(`const ${key} = usePersistFn(%%funBlockAST%%)`)
      nodes.push(methodBuild({ funBlockAST }) as t.VariableDeclaration)
    }

    const methodCompiler = new MethodCompiler(config)

    methodCompiler.transform(ast, nodes)
  }
} as Asset
