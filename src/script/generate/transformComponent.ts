/*
 * @Author: 芦杰
 * @Date: 2022-06-27 16:33:11
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-19 14:17:13
 * @Description: component 的 编译
 */
import t from '@babel/types'

import { Config } from '../config'
import * as Asset from '../asset'

export default function transformComponent(ast: t.File, config: Config) {
  const assets: Array<keyof typeof Asset> = ['data', 'properies', 'methods', 'lifetimes', 'observers', 'computeds']
  assets.forEach(command => {
    const asset = Asset[command]
    if (asset?.shouldTransform) {
      asset.transform(ast, config)
    }
  })
}
