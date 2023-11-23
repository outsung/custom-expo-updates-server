import { put } from "@vercel/blob";
import mime from "mime";

import { createHash, hex2UUID } from "@/lib/crypto";
import { githubReleaseConnect } from "@/lib/githubReleaseConnect";

interface ExpoMetadataAsset {
  path: string;
  ext: string;
}
interface ExpoMetadata {
  version: 0;
  bundler: "metro";
  fileMetadata: {
    ios: { bundle: string; assets: ExpoMetadataAsset[] };
    android: { bundle: string; assets: ExpoMetadataAsset[] };
  };
}

interface ManifestLaunchAsset {
  key: string;
  hash: string;
  fileExtension: ".bundle";
  contentType: "application/javascript";
  url: string;
}
interface ManifestAsset {
  key: string;
  hash: string;
  fileExtension: string;
  contentType: string;
  url: string;
}

interface Manifest {
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

export async function POST(request: Request) {
  const githubRelease = githubReleaseConnect();

  const formData = await request.formData();

  const assetFiles = formData.getAll("assets") as File[];
  const assetFileMap = new Map(assetFiles.map((f) => [f.name, f]));
  const runtimeVersion = formData.get("runtimeVersion") as string;
  const releaseName = formData.get("releaseName") as string;
  const stringMetadata = formData.get("metadata") as string;
  const metadata = JSON.parse(stringMetadata) as ExpoMetadata;
  const expoClient = JSON.parse(formData.get("expoClient") as string) as object;

  console.log("assetFiles", assetFiles);

  const commonManifest = {
    id: hex2UUID(createHash(Buffer.from(stringMetadata), "sha256", "hex")),
    createdAt: new Date().toISOString(),
    runtimeVersion,
    launchAsset: undefined,
    assets: undefined,
    metadata: {},
    extra: { expoClient },
    releaseName,
    platform: undefined,
  };

  console.log("create commonManifest", commonManifest);

  const platforms: ("ios" | "android")[] = [];
  if (metadata.fileMetadata.ios) {
    platforms.push("ios");
  }
  if (metadata.fileMetadata.android) {
    platforms.push("android");
  }

  const _manifests = await Promise.all(
    platforms.map(async (platform) => {
      console.log("call platform", platform);
      const existRelease = await githubRelease.getRelease({
        id: commonManifest.id,
        platform,
        releaseName,
        runtimeVersion,
      });

      console.log("get existRelease", existRelease);

      if (!existRelease) {
        console.log("not have manifest");

        const assetsMetadata = [
          { path: metadata.fileMetadata[platform].bundle, ext: undefined },
          ...metadata.fileMetadata[platform].assets,
        ];

        const [bundle, ...assets] = await Promise.all(
          assetsMetadata.map(async (asset) => {
            const [, fileName] = asset.path.split("/");
            const file = assetFileMap.get(fileName);
            if (!file)
              throw new Error(
                `Asset "${fileName}" not found in uploaded files.`
              );

            const key = asset.ext
              ? fileName
              : fileName.split("-")[1].split(".")[0];

            const hash = createHash(
              Buffer.from(await file.arrayBuffer()),
              "sha256",
              "base64url"
            );

            const { url } = await put(fileName, file, {
              access: "public",
              addRandomSuffix: false,
            });

            const contentType = asset.ext
              ? mime.getType(asset.ext!)
              : "application/javascript";

            const fileExtension = asset.ext ? `.${asset.ext}` : ".bundle";

            return { key, hash, url, contentType, fileExtension };
          })
        );

        // upload:  093e04a279071fd59d0580ba91695844 https://qagecrbcwgiki1oi.public.blob.vercel-storage.com/093e04a279071fd59d0580ba91695844 png
        // upload:  ios-2fe7f14d375cd2e95bb4e6c64c07db43.js https://qagecrbcwgiki1oi.public.blob.vercel-storage.com/ios-2fe7f14d375cd2e95bb4e6c64c07db43.js undefined

        console.log("res", bundle, assets);

        return {
          ...commonManifest,
          platform,
          launchAsset: bundle,
          assets,
        } as Manifest;
      }
    })
  );

  const manifests = _manifests.filter((manifest) => manifest) as Manifest[];

  return new Response(undefined, { status: 200 });
}
