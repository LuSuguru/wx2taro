/*
 * @Author: 芦杰
 * @Date: 2022-06-01 16:58:30
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-07 18:27:49
 * @Description: 模板
 */

export const pageTemplate = ({ code, importCode, scopeName }: { code: string, importCode: string, scopeName: string }) => `
import { FC } from '@tarojs/taro';
${importCode}
const Page:FC = (props)=> {
    return (
        <div className="${scopeName}">
            ${code}    
        </div>
  )
}`
