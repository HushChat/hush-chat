import { Ionicons } from '@expo/vector-icons';
import { Href } from 'expo-router';
interface INavigationItem {
  key: number;
  name: string;
  route: Href;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface TabLayoutProps {
  navigationItems: INavigationItem[];
}

export { INavigationItem, TabLayoutProps };
