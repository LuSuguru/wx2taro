import { FC } from '@tarojs/taro';
import { Image, View } from '@tarojs/components';

const Page: FC = (props) => {
    return (
        <div className="index-2tlo">
            <>
                {navigatorBtn.map((item, index) => (
                    <View
                        className="refund-type-item"
                        onClick={itemTap}
                        data-refund-type={item.refundType}
                        data-refund-sub-type={item.refundSubType}
                    >
                        <View className="left">
                            <Image
                                className="jump-btn-icon-left f-l mr-20 mt-8"
                                src={ICON_MAP[item.icon]}
                                alt=""
                            />

                            <View className="title">{item.title}</View>

                            <View className="description">{item.desc}</View>
                        </View>

                        <Image
                            className="right-arrow"
                            src="https://img.hicdn.cn/fed/images/20190522/c2d1d1a41ab6a68bd7abd7806591eae1.png"
                        />
                    </View>
                ))}
            </>
        </div>
    );
};
