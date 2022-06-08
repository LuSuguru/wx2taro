/*
 * @Author: 芦杰
 * @Date: 2022-06-08 15:50:09
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-08 20:25:35
 * @Description: 编译时的配置项
 */

import t from '@babel/types'

/** 解析出的配置类型 */
export interface Config {
  /** 属性 */
  data: {
    ast: t.ObjectExpression
    /**  属性名列表 */
    stateKeys: string[]
  }
  /** 需要引入的 */
  imports: Map<string, string[]>
}

/** 每种参数属性编译器的定义 */
export abstract class Asset {
  /** 编译源代码属性 AST ，生成 Config */
  static parse: (node: t.ObjectExpression, config: Config) => void
  /** 根据配置生成新的属性代码 AST */
  static transform: (ast: t.File, config: Config) => void
}

// 类型白名单
export const typeWhileList = [
  'ComponentWithComputed',
  'Page',
  'Component'
]

// 参数属性枚举
export enum ArgumentProp {
  Data = 'data',
  Properies = 'properties',
  Computed = 'computed',
  Methods = 'methods',
  Lifetimes = 'lifetimes'
}
