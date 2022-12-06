/*
 * @Descripttion:
 * @Author: bingling
 * @Date: 2021-08-21 18:23:59
 * @LastEditors: bingling
 * @LastEditTime: 2021-09-13 09:30:26
 */

export const tabList = {
    'tlz': [
        {
            text: '全部',
            key: ''
        },
        {
            text: '待支付',
            key: '100'
        },
        {
            text: '待发货',
            key: '55'
        },
        {
            text: '待收货',
            key: '33'
        }
    ],
    'omo': [
        {
            text: '全部',
            key: ''
        },
        {
            text: '待支付',
            key: '100'
        },
        {
            text: '待发货',
            key: '55'
        },
        {
            text: '待收货',
            key: '33'
        },
        {
            text: '已完成',
            key: '43'
        }
    ],
    'hpc': [
        {
            text: '全部',
            key: ''
        },
        {
            text: '待支付',
            key: '100'
        },
        {
            text: '待发货',
            key: '55'
        },
        {
            text: '待收货',
            key: '33'
        },
        {
            text: '已完成',
            key: '43'
        }
    ],
};

export const SCENE_CODE = {
    'tlz': 'HPC_WX_TLZ_GENERATE',
    'omo': 'OMO_WX_QUERY_PROGRAM',
    'hpc': 'HPC_WX_QUERY_PROGRAM'
};

export const ORDER_SOURCE_TYPE = {
    'tlz': 1,
    'omo': 11,
    'hpc': 1
};
