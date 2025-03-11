import { TabBar } from "@/components/TabBar";
import { isAuthenticated } from "@/services/tokenService";
import { Tabs, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

export default function TabsLayout() {
  const tabBarRef = useRef<{ handleUserInteraction: () => void }>(null);
  const router = useRouter();
  const [checkToken, setCheckToken] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const token: boolean = await isAuthenticated();
      if (token) {
        setCheckToken(token);
      } else {
        router.replace("/login"); // Tabs Allow ના થાય
      }
      setLoading(false);
    };
    checkLogin();
  }, []);

  const handleGlobalTouch = () => {
    // Call the tab bar's show function if available
    if (tabBarRef.current) {
      tabBarRef.current.handleUserInteraction();
    }
    // Return false so the touch event still reaches child components
    return false;
  };

  if (loading) return null; // Prevent Flash

  return checkToken ? (
    <View
      style={{ flex: 1 }}
      onStartShouldSetResponderCapture={handleGlobalTouch}
    >
      <Tabs tabBar={(props) => <TabBar ref={tabBarRef} {...props} />}>
        <Tabs.Screen name="index" options={{ headerShown: false }} />
        <Tabs.Screen name="playerBoard" options={{ headerShown: false }} />
        <Tabs.Screen name="setting" options={{ headerShown: false }} />
      </Tabs>
    </View>
  ) : null;
}