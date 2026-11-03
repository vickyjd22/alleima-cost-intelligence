import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ensureBrandFonts } from '../src/theme/fonts';

export default function RootLayout() {
  useEffect(() => {
    ensureBrandFonts();
  }, []);
  return <Stack screenOptions={{ headerShown: false }} />;
}
