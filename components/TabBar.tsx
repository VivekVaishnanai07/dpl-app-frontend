import Colors from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { TabBarButton } from './TabBarButton';

export const TabBar = forwardRef(function TabBar(
  { state, descriptors, navigation }: BottomTabBarProps,
  ref
) {
  const { theme } = useTheme();
  const [dimensions, setDimensions] = useState({ width: 20, height: 100 });
  const buttonWidth = dimensions.width / state.routes.length;

  const onTabbarLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  };

  // Shared values for tab bar visibility
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  // Shared value for the indicator’s horizontal position
  const tabPositionX = useSharedValue(0);

  let hideTimeout: NodeJS.Timeout;
  const resetTimeout = () => {
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 });
      translateY.value = withTiming(50, { duration: 500 });
    }, 5000);
  };

  useFocusEffect(
    useCallback(() => {
      // Ensure the tab indicator moves when returning via the back button
      tabPositionX.value = withTiming(buttonWidth * state.index, { duration: 350 });

      // Reset tab bar visibility timeout
      handleUserInteraction();
    }, [state.index])
  );

  useEffect(() => {
    resetTimeout();
    return () => clearTimeout(hideTimeout);
  }, [state.index]);

  const handleUserInteraction = () => {
    opacity.value = withTiming(1, { duration: 500 });
    translateY.value = withTiming(0, { duration: 500 });
    resetTimeout();
  };

  // Expose the handleUserInteraction function via ref
  useImperativeHandle(ref, () => ({
    handleUserInteraction,
  }));

  const animatedStyles = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value + (buttonWidth / 2 - (buttonWidth - 25) / 2) }],
  }));

  // Animated style for the active background indicator
  const indicatorStyle = useAnimatedStyle(() => {
    // Calculate safe width to fit within tab bar
    const safeWidth = Math.min(buttonWidth - 10, 60);

    return {
      transform: [{ translateX: tabPositionX.value + (buttonWidth - safeWidth) / 2 }], // Centering fix
      width: safeWidth,
      height: 60,
      position: 'absolute',
      backgroundColor: Colors[theme].tabBarIndicator,
      borderRadius: 30,
    };
  });

  // onPress handler for each tab that updates the indicator position
  const onPressHandler = (index: number, routeKey: string, routeName: string, params: any, isFocused: boolean) => {
    // Animate the indicator to the active button's position
    tabPositionX.value = withTiming(buttonWidth * index, { duration: 350 });
    handleUserInteraction();
    const event = navigation.emit({
      type: 'tabPress',
      target: routeKey,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName, params);
    }
  };

  return (
    <Animated.View onLayout={onTabbarLayout} style={[styles.tabbar, animatedStyles, { backgroundColor: Colors[theme].tabBarBackground }]}>
      {/* Active Background Indicator */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            borderRadius: 30,
            marginHorizontal: 0,
            marginVertical: 10,
            height: dimensions.height - 20,
            width: buttonWidth,
          },
          indicatorStyle,
        ]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          onPressHandler(index, route.key, route.name, route.params, isFocused);
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.name}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            color={isFocused ? '#FFF' : '#222'}
            label={label}
            isFocused={isFocused}
            routeName={route.name}
          />
        );
      })}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  tabbar: {
    position: 'absolute',
    bottom: 30,
    transform: [{ translateX: -100 }],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    marginHorizontal: 65,
    paddingVertical: 16,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
    elevation: 10,
  }
});
