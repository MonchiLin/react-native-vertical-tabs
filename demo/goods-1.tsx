import React, { useState } from 'react';
import { Text, View } from 'react-native';
import VerticalTabView from '../dist/index';

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const ClassificationScreen = () => {
  const [dataSource] = useState([
    { classification: '电脑', title: '电脑', height: randomInt(100, 500) },
    {
      classification: '女性用品',
      title: '女性用品',
      height: randomInt(100, 500),
    },
    {
      classification: '男性用品',
      title: '男性用品',
      height: randomInt(100, 500),
    },
    { classification: '护肤品', title: '护肤品', height: randomInt(100, 500) },
    {
      classification: '休闲视频',
      title: '休闲视频',
      height: randomInt(100, 500),
    },
    {
      classification: '生活服务',
      title: '生活服务',
      height: randomInt(100, 500),
    },
    { classification: '书籍', title: '书籍', height: randomInt(100, 500) },
  ]);

  const [routeIndex, changeRouteIndex] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 1)' }}>
      <VerticalTabView
        tabBarContainerProps={{
          style: {
            width: 86,
            backgroundColor: 'rgba(231, 231, 231, 0.3)',
            height: '100%',
          },
        }}
        contentContainerProps={{
          style: {
            width: '100%',
          },
          contentContainerStyle: {
            justifyContent: 'flex-start',
          },
        }}
        dataSource={{ content: dataSource, tabBar: dataSource }}
        index={routeIndex}
        onIndexChange={changeRouteIndex}
        renderTabBar={(item: any, index) => {
          return (
            <View
              style={{
                backgroundColor:
                  routeIndex === index
                    ? 'rgba(255, 255, 255, 1)'
                    : 'transparent',
                width: '100%',
                height: 60,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text>{item.classification}</Text>
            </View>
          );
        }}
        renderContent={(item: any) => (
          <View style={{ height: item.height }}>
            <Text>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default ClassificationScreen;
