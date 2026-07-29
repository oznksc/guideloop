/**
 * Minimal typings for the Vite alias `react-native` → `react-native-web`.
 * Avoids pulling the full @types/react-native package into this example.
 */
declare module 'react-native' {
  import type { ComponentType, ReactNode, CSSProperties } from 'react';

  export interface ViewProps {
    children?: ReactNode;
    style?: object | object[];
    nativeID?: string;
  }

  export interface TextProps {
    children?: ReactNode;
    style?: object | object[];
    nativeID?: string;
  }

  export interface PressableStateCallbackType {
    pressed: boolean;
  }

  export interface PressableProps {
    children?: ReactNode | ((state: PressableStateCallbackType) => ReactNode);
    style?:
      | object
      | object[]
      | ((state: PressableStateCallbackType) => object | object[]);
    onPress?: () => void;
    nativeID?: string;
  }

  export interface SafeAreaViewProps {
    children?: ReactNode;
    style?: object | object[];
  }

  export const View: ComponentType<ViewProps>;
  export const Text: ComponentType<TextProps>;
  export const Pressable: ComponentType<PressableProps>;
  export const SafeAreaView: ComponentType<SafeAreaViewProps>;

  export const StyleSheet: {
    create: <T extends Record<string, CSSProperties | object>>(styles: T) => T;
  };

  export const AppRegistry: {
    registerComponent: (name: string, factory: () => ComponentType) => void;
    runApplication: (
      name: string,
      options: { rootTag: HTMLElement | null }
    ) => void;
  };
}
