/*
 * @Author: 芦杰
 * @Date: 2022-05-20 16:53:01
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-05-20 20:56:39
 * @Description: 类型
 */

/** 节点类型 */
export enum Type {
  /** 文本节点 */
  Text = 'text',
  /** 注释 */
  Comment = 'comment',
  /** tag 开始 */
  TagStart = 'tag-start',
  /** tag 结束 */
  TagEnd = 'tag-end',
  /** Tag 标签 */
  Tag = 'tag',
  /** 属性 */
  Attribute = 'attribute',
  /** 元素 */
  Element = 'element'
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
  content?: string
  close?: boolean
  position?: {
    start?: Position
    end?: Position
  }
}

export interface TextNode {
  type: Type.Text
  content: string
  position: {
    start: Position
    end: Position
  }
}

export interface CommentNode {
  type: Type.Comment
  content: string
  position: {
    start: Position
    end: Position
  }
}

export interface ElementNode {
  type: Type.Element
  tagName: string
  attributes: string[]
  children: (ElementNode | TextNode)[]
  position: {
    start: Position
    end: Position
  }
}

/** 栈节点 */
export interface StackNode {
  tagName: string
  children: (ElementNode | TextNode)[]
  position?: {
    start?: Position
    end?: Position
  }
}
