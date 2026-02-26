type ImagePickerPermissionResponse = { granted: boolean };
type ImagePickerAsset = { uri: string };
type ImagePickerResult = { canceled: boolean; assets?: ImagePickerAsset[] };

type ImagePickerModule = {
  requestMediaLibraryPermissionsAsync: () => Promise<ImagePickerPermissionResponse>;
  requestCameraPermissionsAsync: () => Promise<ImagePickerPermissionResponse>;
  launchImageLibraryAsync: (options: Record<string, unknown>) => Promise<ImagePickerResult>;
  launchCameraAsync: (options: Record<string, unknown>) => Promise<ImagePickerResult>;
  MediaTypeOptions?: { Images?: string };
};

function getImagePickerModule(): ImagePickerModule | null {
  try {
    return require('expo-image-picker') as ImagePickerModule;
  } catch {
    return null;
  }
}

const BASE_OPTIONS = {
  allowsEditing: true,
  aspect: [1, 1] as const,
  quality: 0.8,
};

export function hasImagePickerSupport() {
  return Boolean(getImagePickerModule());
}

export async function pickImageFromLibrary(): Promise<string | null> {
  const picker = getImagePickerModule();
  if (!picker) {
    return null;
  }

  const permission = await picker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const result = await picker.launchImageLibraryAsync({
    mediaTypes: picker.MediaTypeOptions?.Images,
    ...BASE_OPTIONS,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  return result.assets[0].uri;
}

export async function takePhotoWithCamera(): Promise<string | null> {
  const picker = getImagePickerModule();
  if (!picker) {
    return null;
  }

  const permission = await picker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const result = await picker.launchCameraAsync({
    mediaTypes: picker.MediaTypeOptions?.Images,
    ...BASE_OPTIONS,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  return result.assets[0].uri;
}
