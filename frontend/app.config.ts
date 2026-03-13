import { ExpoConfig } from 'expo/config';

const googleIosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  ios: {
    ...(config.ios ?? {}),
    infoPlist: {
      ...(config.ios?.infoPlist ?? {}),
      NSCameraUsageDescription: 'Precisamos de acesso à câmera para atualizar sua foto de perfil.',
      NSPhotoLibraryUsageDescription: 'Precisamos de acesso à galeria para selecionar sua foto de perfil.',
      NSPhotoLibraryAddUsageDescription: 'Precisamos de acesso para salvar fotos editadas no seu perfil.',
    },
  },
  android: {
    ...(config.android ?? {}),
    permissions: Array.from(
      new Set([
        ...((config.android?.permissions as string[] | undefined) ?? []),
        'CAMERA',
        'READ_MEDIA_IMAGES',
      ]),
    ),
  },
  plugins: [
    ...((config.plugins as any[]) ?? []),
    ...(googleIosUrlScheme
      ? [
          [
            '@react-native-google-signin/google-signin',
            {
              iosUrlScheme: googleIosUrlScheme,
            },
          ],
        ]
      : []),
    [
      'expo-image-picker',
      {
        photosPermission: 'Precisamos de acesso às suas fotos para atualizar seu perfil.',
        cameraPermission: 'Precisamos de acesso à câmera para tirar sua foto de perfil.',
      },
    ],
  ],
  extra: {
    ...(config.extra ?? {}),
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  },
});
