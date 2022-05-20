/*
 * @Author: 芦杰
 * @Date: 2022-05-20 16:53:01
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-05-20 17:27:43
 * @Description: 类型
 */

/** 节点类型 */
export enum Type {
  /** 文本节点 */
  Text = 'text'
}

/** 位置信息 */
export interface Position {
  index: number
  column: number
  line: number
}

/** 词法分析单元 */
export interface Token {
  type: Type
  content: string
  position: {
    start: Position
    end: Position
  }
}

/** 整个状态 */
export interface State {
  str: string
  tokens: Token[]
  position: Position
}
