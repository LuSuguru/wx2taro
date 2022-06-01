/*
 * @Author: 芦杰
 * @Date: 2022-06-01 16:58:30
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-06-01 18:17:03
 * @Description: 模板
 */

export const pageTemplate = ({ code, importCode }: { code: string, importCode: string }) => `
import { FC } from '@tarojs/taro';
${importCode}
const Page:FC = (props)=> {
    return (
        <>
            ${code}    
        </>
  )
}`
