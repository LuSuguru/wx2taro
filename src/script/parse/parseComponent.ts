/*
 * @Author: 芦杰
 * @Date: 2022-06-24 11:34:56
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-19 16:37:09
 * @Description: component 的解析
 */
import { NodePath } from '@babel/traverse'
import * as t from '@babel/types'

import { ArgumentProp, Config } from '../config'
import * as Asset from '../asset'

/** 参数属性到对应的编译 Asset 的映射 */
const argumentPropToAssetMap = new Map([
  [ArgumentProp.Data, Asset.data],
  [ArgumentProp.Properies, Asset.properies],
  [ArgumentProp.Methods, Asset.methods],
  [ArgumentProp.Computed, Asset.computeds],
  [ArgumentProp.Lifetimes, Asset.lifetimes],
  [ArgumentProp.Observers, Asset.observers]
])

export default function parseComponent<T extends t.ObjectExpression['properties']>(properties: T, config: Config, path?: NodePath<T>) {
  properties.forEach((property, index) => {
    // comonent 里的配置都是 ObjectProperty，因此只编译 ObjectProperty
    // {
    //   编译
    //   xxx: {

    //   },
    //   跳过:
    //   yyy() {

    //   }
    // }
    if (!t.isObjectProperty(property)) return

    const key = property.key as t.Identifier
    const value = property.value as t.ObjectExpression

    // 获取当前 node 的 path
    const childPath = path[index] as NodePath<t.ObjectProperty>

    // 根据属性的类型选择不同的 asset 编译
    const asset = argumentPropToAssetMap.get(key.name as ArgumentProp)
    if (asset) {
      // 重置状态
      asset.reset()
      asset.parse(value, config, childPath)
    }
  })
}
