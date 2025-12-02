import { Tabs } from "expo-router";
import MobileNavigationInterface from "@/components/tab-layouts/navigations/MobileNavigationInterface";
import { TabLayoutProps } from "@/types/navigation/types";

const MobileTabLayout = (tabLayoutProps: TabLayoutProps) => {
  const { navigationItems } = tabLayoutProps;

  return (
    <Tabs
      tabBar={(props) => <MobileNavigationInterface navigationItems={navigationItems} {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {navigationItems.map((item) => (
        <Tabs.Screen
          key={item.key}
          name={item.name}
          options={{
            title: item.title,
          }}
        />
      ))}
    </Tabs>
  );
};

export default MobileTabLayout;
