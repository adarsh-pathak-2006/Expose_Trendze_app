import { useFonts } from 'expo-font';
import {
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_700Bold,
} from '@expo-google-fonts/rubik';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { COLORS } from './constants/theme';
import { useBootstrap } from './hooks/useBootstrap';
import { AppNavigator } from './navigation/AppNavigator';
import { useAuthStore } from './store/authStore';

export default function App() {
  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_700Bold,
  });

  useBootstrap();

  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);

  if (!fontsLoaded || isBootstrapping) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    flex: 1,
    justifyContent: 'center',
  },
});
