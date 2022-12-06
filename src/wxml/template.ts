/*
 * @Author: 芦杰
 * @Date: 2022-06-01 16:58:30
 * @LastEditors: 芦杰
 * @LastEditTime: 2022-07-04 15:50:07
 * @Description: 模板
 */

export const pageTemplate = ({ code, scopeName }: { code: string, scopeName: string }) => `
const Page:FC = (props)=> {
    return (
        <div className="${scopeName}">
            ${code}    
        </div>
  )
}
export default Page`
