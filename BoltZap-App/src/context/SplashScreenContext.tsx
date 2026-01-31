import type { FC, PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import RNBootSplash from 'react-native-bootsplash';

interface SplashScreenContextType {
  closeSplashScreen: () => void;
}

export const SplashScreenContext =
  createContext<SplashScreenContextType | null>(null);

export const SplashScreenProvider: FC<PropsWithChildren> = ({ children }) => {
  const [showSplashState, setShowSplashState] = useState(true);

  const closeSplashScreen = useCallback(() => {
    if (!showSplashState) {
      return;
    }

    RNBootSplash.hide({ fade: true });
    setShowSplashState(false);
  }, [showSplashState]);

  return (
    <SplashScreenContext.Provider value={{ closeSplashScreen }}>
      {children}
    </SplashScreenContext.Provider>
  );
};

export const useSplashScreenContext = () => {
  const context = useContext(SplashScreenContext);
  if (!context) {
    throw new Error(
      'useSplashScreenContext must be used within SplashScreenProvider',
    );
  }
  return context;
};
