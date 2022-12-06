/*
 * @Description: 配置
 * @Author: 芦杰
 * @Date: 2022-06-30 11:37:48
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-30 11:39:57
 */
export interface ComponentConfigJson {
  /** 引用的组件 */
  usingComponents: {
    [tagName: string]: string;
  };
}
