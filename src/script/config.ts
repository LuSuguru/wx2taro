/*
 * @Author: 芦杰
 * @Date: 2022-06-08 15:50:09
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-14 16:41:07
 * @Description: 编译时的配置项
 */

import { NodePath } from '@babel/traverse'
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
  /** 计算属性 */
  computeds: Map<string, {
    value: t.BlockStatement
    /** 依赖 */
    deps: string[]
  }>
  /** 不是页面，函数构造器的代码 AST */
  notConstructor: t.Node[]

  /** 需要引入的 */
  imports: Map<string, string[]>
}

/** 每种参数属性编译器的定义 */
export interface Asset {
  /** 编译源代码属性 AST ，生成 Config */
  parse(node: t.ObjectExpression, config: Config, oldAst?: NodePath<t.ObjectProperty>): void
  /** 根据配置生成新的属性代码 AST */
  transform(newAst: t.File, config: Config): void
}

/** 类型白名单 */
export const typeWhileList = [
  'ComponentWithComputed',
  'Page',
  'Component'
]

/** import 黑名单，编译时直接删除 */
export const importBlackList = [
  'miniprogram-computed'
]

/** 参数属性枚举 */
export enum ArgumentProp {
  Data = 'data',
  Properies = 'properties',
  Computed = 'computed',
  Methods = 'methods',
  Lifetimes = 'lifetimes'
}
