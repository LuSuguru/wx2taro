/*
 * @Author: 芦杰
 * @Date: 2022-05-26 14:36:03
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-07 14:34:26
 * @Description: 入口
 */
import chalk from 'chalk'

import transformWXML from './wxml'

function run() {
  console.log(chalk.green('编译开始'))
  transformWXML()
}

run()
