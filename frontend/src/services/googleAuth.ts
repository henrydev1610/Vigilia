import { GoogleSignin } from '@react-native-google-signin/google-signin';

const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

GoogleSignin.configure({
  webClientId: googleWebClientId,
  iosClientId: googleIosClientId,
  scopes: ['profile', 'email'],
});

export class GoogleAuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GoogleAuthConfigurationError';
  }
}

export async function signInWithGoogle() {
  if (!googleWebClientId) {
    throw new GoogleAuthConfigurationError(
      'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID nao configurado no app.',
    );
  }

  await GoogleSignin.hasPlayServices({
    showPlayServicesUpdateDialog: true,
  });

  const response = await GoogleSignin.signIn();
  if (response.type !== 'success' || !response.data.idToken) {
    throw new Error('Login com Google cancelado ou sem idToken.');
  }

  return {
    idToken: response.data.idToken,
    user: response.data.user,
  };
}

export async function signOutFromGoogle() {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Ignore provider sign-out failures; local session cleanup still matters most.
  }
}
