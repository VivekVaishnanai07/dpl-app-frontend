import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export function TabBarButton({ accessibilityState, accessibilityLabel, testID, onPress, onLongPress, label, routeName, isFocused }: any) {
  const icon: any = {
    index: (props: any) => <AntDesign name="home" size={24} {...props} />,
    setting: (props: any) => <Ionicons name="settings-outline" size={24} {...props} />,
    playerBoard: (props: any) => <MaterialCommunityIcons name="cricket" size={24} {...props} />,
  };

  // 🔥 Always call hooks in the same order
  const iconColor = useThemeColor({ light: '#222', dark: '#000' }, 'icon');
  const textColor = useThemeColor({ light: '#222', dark: '#000' }, 'text');
  const activeIconColor = '#FFF'; // White for active state

  const scale = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, { duration: 350 });
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(scale.value, [0, 1], [1, 1.2]) }],
    top: interpolate(scale.value, [0, 1], [0, 11]),
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scale.value, [0, 1], [1, 0]),
  }));

  return (
    <Pressable
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tableItem}
    >
      <Animated.View style={animatedIconStyle}>
        {icon[routeName]({ color: isFocused ? activeIconColor : iconColor })}
      </Animated.View>
      <Animated.Text
        style={[
          { color: textColor, fontSize: 10, fontFamily: 'Poppins-Medium', textTransform: 'capitalize' },
          animatedTextStyle,
        ]}
      >
        {label === 'index' ? 'Home' : label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tableItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 5,
  },
});
