type SplashModule = {
  preventAutoHideAsync?: () => Promise<void>;
  hideAsync?: () => Promise<void>;
};

let splashModule: SplashModule | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
  splashModule = require('expo-splash-screen') as SplashModule;
} catch {
  splashModule = null;
}

export async function preventNativeSplashAutoHide() {
  if (!splashModule?.preventAutoHideAsync) return;
  await splashModule.preventAutoHideAsync();
}

export async function hideNativeSplash() {
  if (!splashModule?.hideAsync) return;
  await splashModule.hideAsync();
}

