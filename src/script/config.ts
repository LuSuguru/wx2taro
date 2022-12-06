/*
 * @Author: 芦杰
 * @Date: 2022-06-08 15:50:09
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-19 16:15:19
 * @Description: 编译时的配置项
 */

import { NodePath } from '@babel/traverse'
import t from '@babel/types'

import { Imports } from '../config'

/** 解析出的配置类型 */
export interface Config {
  /** 类型 */
  type: Type
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
    value: t.ObjectMethod | t.ObjectProperty
  }>
  /** 计算属性 */
  computeds: Map<string, {
    value: t.BlockStatement
    /** 依赖 */
    deps: string[]
  }>
  /** 不是页面，函数构造器的代码 AST */
  notConstructor: t.Node[]
  /** 组件生命周期 */
  lifetimes: Map<string, {
    value: t.BlockStatement
  }>,
  /** 组件数据字段监听器 */
  observers: Map<string, {
    value: t.BlockStatement
    /** 依赖的父属性，state 或者 props */
    fatherProp: 'state' | 'props'
  }>
  pageMethods: Map<string, {
    value: t.ObjectMethod
    needTaroApi?: boolean
  }>
  /** 需要引入的 */
  imports: Imports
}

/** 每种参数属性编译器的定义 */
export interface Asset {
  /** 重置编译器的状态 */
  reset(): void
  /** 编译源代码属性 AST ，生成 Config */
  parse(node: t.ObjectExpression, config: Config, oldAst?: NodePath<t.ObjectProperty>): void
  /** 根据配置生成新的属性代码 AST */
  transform(newAst: t.File, config: Config): void
  /** 是否执行 transform */
  shouldTransform: boolean
}

/** 类型白名单 */
export enum Type {
  ComponentWithComputed = 'ComponentWithComputed',
  Page = 'Page',
  Component = 'Component'
}

export const typeWhileList = [
  Type.Component,
  Type.ComponentWithComputed,
  Type.Page
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
  Lifetimes = 'lifetimes',
  Observers = 'observers'
}

/** Page 里的一些 API 配置转化为 taro 的配置 */
export const PageApi2TaroApiMap = new Map([
  ['onLoad', 'useLoad'],
  ['onReady', 'useReady'],
  ['onShow', 'useDidShow'],
  ['onHide', 'useDidHide'],
  ['onUnload', 'useUnload'],
  ['onPullDownRefresh', 'usePullDownRefresh'],
  ['onReachBottom', 'useReachBottom'],
  ['onPageScroll', 'usePageScroll'],
  ['onResize', 'useResize'],
  ['onShareAppMessage', 'useShareAppMessage'],
  ['onShareTimeline', 'useShareTimeline'],
  ['onAddToFavorites', 'useAddToFavorites'],
  ['onSaveExitState', 'useSaveExitState'],
  ['onTabItemTap', 'useTabItemTap']
])
