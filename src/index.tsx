import React, { useCallback, useEffect, useRef } from 'react';
import {
  LayoutChangeEvent,
  ScrollView,
  ScrollViewProps,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps
} from 'react-native';

const head = arr => arr[0];
const tail = arr => arr[arr.length - 1];
const prop = (key, obj?) => {
  if (typeof obj === 'undefined') {
    return obj => obj?.[key];
  }
  return obj?.[key];
};

const sumBy = (initialValue = 0, fn, arr) => {
  return arr.reduce((prev, curr) => {
    return prev + fn(curr);
  }, initialValue);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultKeyExtractor = (_: any, index: number) => {
  return index.toString();
};

type Props<ContentItem, TabBarItem> = {
  props?: ViewProps;

  // 渲染内容区域
  renderContent: (item: ContentItem, index: number) => React.ReactNode;
  // 渲染 tabBar
  renderTabBar: (item: TabBarItem, index: number) => React.ReactNode;

  // 内容区域的 props
  contentContainerProps?: ScrollViewProps;
  // 内容区域 的 props
  contentProps?: Omit<TouchableOpacityProps, 'onPress' | 'key'>;
  // content 的 key，默认取 index
  contentKeyExtractor?: (item: ContentItem, index: number) => string;

  // tabBar 的容器 props
  tabBarContainerProps?: Omit<
    ScrollViewProps,
    'ref' | 'onScroll' | 'onScrollBeginDrag' | 'onScrollEndDrag'
  >;
  // tabBar 的 props
  tabBarProps?: Omit<ViewProps, 'onLayout'>;
  // tabBar 的 key，默认取 index
  tabBarKeyExtractor?: (item: TabBarItem, index: number) => string;

  // 数据源
  dataSource: {
    tabBar: Array<TabBarItem>;
    content: Array<ContentItem>;
  };

  // 被激活的 tabBar index
  index;

  // 改变被激活 tabBar
  onIndexChange;
};

const VerticalTabs = <ContentItem, TabBarItem>({
  props = {},

  renderContent,
  renderTabBar,

  contentContainerProps = {},
  contentProps = {},
  contentKeyExtractor = defaultKeyExtractor,

  tabBarContainerProps = {},
  tabBarProps = {},
  tabBarKeyExtractor = defaultKeyExtractor,

  dataSource,
  index,
  onIndexChange
}: Props<ContentItem, TabBarItem>) => {
  // 是否正在滚动
  const isScrolling = useRef(false);

  // 开始滚动是的 y 轴位置，用于计算滚动方向
  const offsetY = useRef(0);

  // 储存通过 onLayout 事件 item 元素的高度
  const viewInfoRef = useRef([]);

  const scrollViewRef = useRef(null);

  const onScroll = useCallback(
    e => {
      if (isScrolling.current) {
        return;
      }
      e.persist();
      const { y } = e.nativeEvent.contentOffset;

      // 如果 y 小于 0 则表示滚动到顶部了
      if (y <= 0) {
        onIndexChange(head(viewInfoRef.current).index);
        return;
      }

      // 是否是向下滑动的
      const downward = offsetY.current < y;
      const classification = viewInfoRef.current.find(item => {
        return downward
          ? y < item.accumulationHeight - item.height
          : y < item.accumulationHeight - item.height;
      });

      const item =
        classification || (downward ? tail(viewInfoRef.current) : head(viewInfoRef.current));

      onIndexChange(item.index);
    },
    [onIndexChange]
  );

  const adjustContent = useCallback(index => {
    isScrolling.current = true;
    const accumulationHeight = sumBy(0, prop('height'), viewInfoRef.current.slice(0, index));

    scrollViewRef.current.scrollTo({
      y: accumulationHeight
    });
    offsetY.current = 0;
  }, []);

  const onScrollBeginDrag = event => {
    offsetY.current = event.nativeEvent.contentOffset.y;
  };

  const onScrollEndDrag = () => {
    isScrolling.current = false;
  };

  const onLayout = useCallback((e: LayoutChangeEvent, index: number) => {
    // @ts-ignore
    e.persist();
    const { height } = e.nativeEvent.layout;
    // 记录当前元素的索引(index)，高度(height)，累计高度(accumulationHeight): 上面的元素 + 这个元素的自身的高度
    viewInfoRef.current[index] = {
      index,
      height,
      accumulationHeight: sumBy(0, prop('height'), viewInfoRef.current) + height
    };
  }, []);

  /**
   * 当 content 部分改变的时候会重新一轮 render，在这同时又会重新触发 onLayout 事件
   * 这时要将 viewInfo 重置, 避免产生脏数据
   */
  useEffect(() => {
    viewInfoRef.current = [];
  }, [dataSource.content]);

  useEffect(() => {
    adjustContent(index);
    // 这里不需要监听 adjustContent 是否改变，因为 adjustContent 永远不会改变
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <View style={{ flex: 1, flexDirection: 'row' }} {...props}>
      <ScrollView {...tabBarContainerProps}>
        {dataSource.tabBar.map((item, index) => {
          return (
            <TouchableOpacity
              {...tabBarProps}
              onPress={() => onIndexChange(index)}
              key={tabBarKeyExtractor(item, index)}
            >
              {renderTabBar(item, index)}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={100}
        {...contentContainerProps}
        ref={scrollViewRef}
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
      >
        {dataSource.content.map((item, index) => {
          return (
            <View
              {...contentProps}
              key={contentKeyExtractor(item, index)}
              onLayout={e => onLayout(e, index)}
            >
              {renderContent(item, index)}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default VerticalTabs;
