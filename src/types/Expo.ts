export interface ExpoMetadataAsset {
  path: string;
  ext: string;
}
export interface ExpoMetadata {
  version: 0;
  bundler: "metro";
  fileMetadata: {
    ios: { bundle: string; assets: ExpoMetadataAsset[] };
    android: { bundle: string; assets: ExpoMetadataAsset[] };
  };
}

export interface ManifestLaunchAsset {
  key: string;
  hash: string;
  fileExtension: ".bundle";
  contentType: "application/javascript";
  url: string;
}
export interface ManifestAsset {
  key: string;
  hash: string;
  fileExtension: string;
  contentType: string;
  url: string;
}

export interface Manifest {
  id: string;
  createdAt: string;
  runtimeVersion: string;
  launchAsset: ManifestLaunchAsset;
  assets: ManifestAsset[];
  metadata: {};
  extra: { expoClient: object };
  releaseName: string;
  platform: "ios" | "android";
}
