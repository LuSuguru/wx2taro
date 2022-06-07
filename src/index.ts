/*
 * @Author: 芦杰
 * @Date: 2022-05-26 14:36:03
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-07 16:46:31
 * @Description: 入口
 */
import chalk from 'chalk'
import fse from 'fs-extra'
import path from 'path'
import glob from 'glob-promise'

import transformWXML from './wxml'
import { TARGET_DIR } from './config'

function getDir() {
  const dir = process.argv?.[2]
  if (dir) {
    return dir
  }
  // TODO:用户未输入路径参数，默认获取
  return ''
}

async function run() {
  const dir = getDir()
  const parseDir = path.join(process.cwd(), dir)

  console.log(chalk.green('编译开始!'))

  const entry = await glob(`${parseDir}/*.json`)

  // 采用串行，方便查看哪个文件编译失败
  entry.forEach(async (entryPath) => {
    const parsedEntry = path.parse(entryPath)
    const jsxCode = transformWXML(parsedEntry)

    // 创建模板目录
    fse.ensureDirSync(path.join(parseDir, TARGET_DIR))
    fse.writeFileSync(path.join(parsedEntry.dir, `./${TARGET_DIR}/${parsedEntry.name}.tsx`), jsxCode)
  })
}

run()
