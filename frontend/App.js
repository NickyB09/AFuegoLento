import './global.css';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppShell } from './src/features/app/AppShell';

// Punto de entrada visual: envuelve la app con área segura para web/móvil.
export default function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}
