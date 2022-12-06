/*
 * @Author: 芦杰
 * @Date: 2022-06-07 15:44:59
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-15 16:15:00
 * @Description: 配置
 */

export type Identifier = string | {
  type: 'global',
  name: string
}
export type Imports = Map<string, Set<Identifier>>

export const eventMap = {
  tap: 'onClick',
  confirm: 'onKeyDown',
}
