import { TabLayoutProps } from '@/types/navigation/types';
import { View } from 'react-native';
import WebNavigationInterface from '@/components/tab-layouts/navigations/WebNavigationInterface';
import { Stack } from 'expo-router';

const WebTabLayout = (tabLayoutProps: TabLayoutProps) => {
  const { navigationItems } = tabLayoutProps;

  return (
    <View className="flex-1">
      <WebNavigationInterface navigationItems={navigationItems} />
      <View className="flex-1" style={{ marginLeft: 80 }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          {navigationItems.map((item) => (
            <Stack.Screen key={item.key} name={item.name} />
          ))}
        </Stack>
      </View>
    </View>
  );
};

export default WebTabLayout;
