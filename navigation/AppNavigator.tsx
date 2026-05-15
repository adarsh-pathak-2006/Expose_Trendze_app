import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORS, FONTS } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import type { AdminTabParamList, MainTabParamList, RootStackParamList } from '../types/navigation';
import { AdminHomeScreen } from '../screens/AdminHomeScreen';
import { AdminOrderControlScreen } from '../screens/AdminOrderControlScreen';
import { AdminOrdersScreen } from '../screens/AdminOrdersScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { OrderHistoryScreen } from '../screens/OrderHistoryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TrackingScreen } from '../screens/TrackingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();
const AdminTabs = createBottomTabNavigator<AdminTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.primary,
    card: COLORS.primary,
    border: COLORS.border,
    primary: COLORS.accent,
    text: COLORS.white,
  },
};

function TabsNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        component={HomeScreen}
        name="Home"
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons color={color} name="home-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        component={OrderHistoryScreen}
        name="Orders"
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons color={color} name="clipboard-list-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        component={TrackingScreen}
        name="Track"
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons color={color} name="timeline-text-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        component={ProfileScreen}
        name="Profile"
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons color={color} name="account-circle-outline" size={size} />,
        }}
      />
    </Tabs.Navigator>
  );
}

function AdminTabsNavigator() {
  return (
    <AdminTabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <AdminTabs.Screen
        component={AdminHomeScreen}
        name="AdminHome"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons color={color} name="shield-crown-outline" size={size} />,
        }}
      />
      <AdminTabs.Screen
        component={AdminOrdersScreen}
        name="AdminOrders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons color={color} name="clipboard-edit-outline" size={size} />,
        }}
      />
      <AdminTabs.Screen
        component={ProfileScreen}
        name="Profile"
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons color={color} name="account-circle-outline" size={size} />,
        }}
      />
    </AdminTabs.Navigator>
  );
}

function AuthenticatedStack() {
  const logout = useAuthStore((state) => state.logout);
  const role = useAuthStore((state) => state.role);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontFamily: FONTS.heading, fontSize: 20 },
        contentStyle: { backgroundColor: COLORS.primary },
      }}
    >
      <Stack.Screen
        component={role === 'admin' ? AdminTabsNavigator : TabsNavigator}
        name="MainTabs"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        component={AdminOrderControlScreen}
        name="AdminOrderControl"
        options={{
          title: 'Admin Control',
          headerRight: () => (
            <Pressable onPress={logout}>
              <Text style={styles.headerAction}>Logout</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        component={OrderDetailScreen}
        name="OrderDetail"
        options={{
          title: 'Order Detail',
          headerRight: () => (
            <Pressable onPress={logout}>
              <Text style={styles.headerAction}>Logout</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        component={TrackingScreen}
        name="Tracking"
        options={{
          title: 'Live Tracking',
        }}
      />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer theme={navTheme}>
      {isAuthenticated ? (
        <AuthenticatedStack />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.primary } }}>
          <Stack.Screen component={LoginScreen} name="Login" />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.primary,
    borderTopColor: COLORS.accent,
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
  headerAction: {
    color: COLORS.accent,
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
  },
});
