/*
 * @Author: 芦杰
 * @Date: 2022-05-26 14:36:15
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-05-26 16:56:02
 * @Description: wxml 入口
 */
import fse from 'fs-extra'
import Path from 'path'

import parse from './parse'

export default async function tramsform() {
  const data = await fse.readFile(Path.join(process.cwd(), './demo/index.wxml'))

  fse.writeFileSync(Path.join(process.cwd(), './build/result.json'), JSON.stringify(parse(data.toString()), null, 2))
}
