/*
 * @Author: 芦杰
 * @Date: 2022-06-24 14:59:04
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-19 16:38:15
 * @Description: Page 的解析
 */

import * as t from '@babel/types'

import { addImportConfig } from '../../utils'
import * as Asset from '../asset'
import { ArgumentProp, Config, PageApi2TaroApiMap } from '../config'

export default function parsePage<T extends t.ObjectExpression['properties']>(properties: T, config: Config) {
  properties.forEach((property: t.ObjectProperty | t.ObjectMethod) => {
    const key = property.key as t.Identifier

    if (t.isObjectProperty(property)) {
      const value = property.value as t.ObjectExpression

      switch (key.name) {
        case ArgumentProp.Data:
          Asset.data.reset()
          Asset.data.parse(value, config)
          break
      }
    }

    // 对象函数形式
    // onLoad() {
    //   getFp(this, wx.getStorageSync('userId') || '');
    // }
    if (t.isObjectMethod(property)) {
      if (PageApi2TaroApiMap.has(key.name)) {
        config.pageMethods.set(PageApi2TaroApiMap.get(key.name), {
          value: property,
          needTaroApi: true
        })
        addImportConfig(config.imports, '@tarojs/taro', PageApi2TaroApiMap.get(key.name))
        addImportConfig(config.imports, '@yt/react-hooks', 'usePersistFn')
      } else {
        config.pageMethods.set(key.name, {
          value: property
        })
      }
    }
  })
}
