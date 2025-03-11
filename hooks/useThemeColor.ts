import Colors from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light
) {
  const { theme } = useTheme();
  const colorFromProps = props[theme];

  return colorFromProps || Colors[theme][colorName];
}
