/*
 * @Author: 芦杰
 * @Date: 2022-06-08 15:50:09
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-13 16:15:36
 * @Description: 编译时的配置项
 */

import t from '@babel/types'

/** 解析出的配置类型 */
export interface Config {
  /** 状态 */
  data: {
    ast: t.ObjectExpression
    /** 状态名列表 */
    stateKeys: string[]
  },
  /** 属性 */
  properties: Map<string, {
    value: t.Node
  }>
  /** 方法 */
  methods: Map<string, {
    value: t.ObjectMethod
  }>

  /** 需要引入的 */
  imports: Map<string, string[]>
}

/** 每种参数属性编译器的定义 */
export interface Asset {
  /** 编译源代码属性 AST ，生成 Config */
  parse(node: t.ObjectExpression, config: Config): void
  /** 根据配置生成新的属性代码 AST */
  transform(ast: t.File, config: Config): void
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
