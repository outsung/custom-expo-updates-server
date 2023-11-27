export interface GithubReleaseInfo {
  draft: boolean;
  prerelease: boolean;
  tag_name: string;
  body: string;
  published_at: string;
}

export interface GithubReleaseInfoEntity {
  id: string;
  releaseName: string;
  runtimeVersion: string;
  platform: string;
  stringManifest: string;
  createdAt: string;
}
