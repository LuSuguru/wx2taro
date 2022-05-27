/*
 * @Author: 芦杰
 * @Date: 2022-05-26 14:36:15
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-05-27 17:49:22
 * @Description: wxml 入口
 */
import fse from 'fs-extra'
import Path from 'path'

import parse from './parse'

export default async function tramsform() {
  const data = await fse.readFile(Path.join(process.cwd(), './demo/index.wxml'))

  const ast = parse(data.toString())
}
