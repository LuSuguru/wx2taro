/*
 * @Author: 芦杰
 * @Date: 2022-05-26 14:36:15
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-01 18:21:59
 * @Description: wxml 入口
 */
import fse from 'fs-extra'
import Path from 'path'

import parse from './parse'
import generate from './generate'
import { pageTemplate } from './template'

import { formatCode } from '../utils/babel-utils'

export default async function tramsform() {
  const data = await fse.readFile(Path.join(process.cwd(), './demo/index.wxml'))

  const ast = parse(data.toString())
  const { blocks, compSrcMap } = generate(ast)

  let code = ''
  for (const entry of Object.entries(blocks)) {
    const [name, value] = entry

    if (Number.isNaN(+name)) {
      code = code
        .replace(`$template$${name}$`, value)
        .replace(`$slot${name}$`, value) || ''
    } else {
      code += value
    }
  }

  const importCode = [...compSrcMap].reduce((pre, [path, components]) => `${pre}import {${components.join(',')}} from '${path}'\n`, '')

  fse.writeFileSync(Path.join(process.cwd(), './build/index.tsx'), formatCode(pageTemplate({ code, importCode })))
}
