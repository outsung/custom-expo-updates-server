import { put } from "@vercel/blob";
import mime from "mime";
import { revalidatePath } from "next/cache";

import { createHash, hex2UUID } from "@/lib/crypto";
import { githubReleaseConnect } from "@/lib/githubReleaseConnect";
import { ExpoMetadata, Manifest } from "@/types";

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

  const platforms: ("ios" | "android")[] = [];
  if (metadata.fileMetadata.ios) {
    platforms.push("ios");
  }
  if (metadata.fileMetadata.android) {
    platforms.push("android");
  }

  const _manifests = await Promise.all(
    platforms.map(async (platform) => {
      const existRelease = await githubRelease.getRelease({
        id: commonManifest.id,
        platform,
        releaseName,
        runtimeVersion,
      });

      if (!existRelease) {
        const assetsMetadata = [
          { path: metadata.fileMetadata[platform].bundle, ext: undefined },
          ...metadata.fileMetadata[platform].assets,
        ];

        const [bundle, ...assets] = await Promise.all(
          assetsMetadata.map(async (asset) => {
            const fileName = asset.path.split("/").pop() || "";
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

            const { url } = await put(
              asset.ext ? `${fileName}.${asset.ext}` : fileName,
              file,
              {
                access: "public",
                addRandomSuffix: false,
              }
            );

            const contentType = asset.ext
              ? mime.getType(asset.ext!)
              : "application/javascript";

            const fileExtension = asset.ext ? `.${asset.ext}` : ".bundle";

            return { key, hash, url, contentType, fileExtension };
          })
        );

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
  const res = await Promise.all(
    manifests.map(async (manifest) => {
      return await githubRelease.createRelease({
        id: manifest.id,
        platform: manifest.platform,
        releaseName: manifest.releaseName,
        runtimeVersion: manifest.runtimeVersion,
        stringManifest: JSON.stringify(manifest),
      });
    })
  );

  if (res.length) {
    revalidatePath("/");
  }

  return new Response(undefined, { status: 200 });
}
