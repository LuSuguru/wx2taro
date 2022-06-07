/*
 * @Author: 芦杰
 * @Date: 2022-06-07 16:05:54
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-07 18:29:22
 * @Description: wxss 解析入口
 */
import { ParsedPath } from 'path'
import chalk from 'chalk'
import glob from 'glob-promise'
import postcss, { Root } from 'postcss'
import fse from 'fs-extra'

function rpx2pxPlugin(root: Root) {
  root.walkDecls((decl) => {
    let { value } = decl
    value = value.replace(/([0-9.]+)rpx/ig, (_, size) => size + 'px')
    decl.value = value
  })
}

export default async function transform({ name, dir }: ParsedPath, scopeName: string) {
  const cssPaths = await glob(`${dir}/${name}.@(less|wxss)`)

  if (!cssPaths?.length) {
    return
  }

  const [cssPath] = cssPaths

  console.log(chalk.white.bgBlue(`${cssPath}  编译开始~`))

  let data = fse.readFileSync(cssPath).toString()
  data = `.${scopeName}{\n${data}\n}`

  const { css } = await postcss([rpx2pxPlugin]).process(data, { from: cssPath })

  console.log(chalk.white.bgGreen(`${cssPath} 编译成功~`))
  return css
}
