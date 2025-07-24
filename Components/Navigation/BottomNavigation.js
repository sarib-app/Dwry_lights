import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
// import languageService from '../Globals/Store/Lang';
import languageService from '../Globals/Store/Lang';
import SettingsScreen from '../Settings/SettingScreen';
import NotificationsScreen from '../Notifications/NotificationScreen';
import ActionsScreen from '../ActionScreen/ActionScreen';
import InsightsScreen from '../Insights/InsightScreen';
import ReportsDashboardScreen from '../ActionScreen/ReportActions';

// import InsightsScreen from './InsightsScreen';
// import ActionsScreen from './ActionsScreen';
// import NotificationsScreen from './NotificationsScreen';
// import SettingsScreen from './SettingsScreen';

const Tab = createBottomTabNavigator();

const MainBottomTabs = () => {
  const translate = (key) => languageService.translate(key);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Insights') iconName = focused ? 'analytics' : 'analytics-outline';
          else if (route.name === 'Actions') iconName = focused ? 'menu' : 'menu-outline';
          else if (route.name === 'Notifications') iconName = focused ? 'notifications' : 'notifications-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6B7D3D',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 85,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Insights" 
        component={ReportsDashboardScreen}
        options={{ tabBarLabel: translate('insights') }}
      />
      <Tab.Screen 
        name="Actions" 
        component={ActionsScreen}
        options={{ tabBarLabel: translate('actions') }}
      />
      {/* <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ tabBarLabel: translate('notifications') }}
      /> */}
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ tabBarLabel: translate('settings') }}
      />
    </Tab.Navigator>
  );
};

export default MainBottomTabs;