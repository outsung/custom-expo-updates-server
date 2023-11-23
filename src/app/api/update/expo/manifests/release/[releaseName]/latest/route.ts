import FormData from "form-data";
import { Readable } from "stream";

import { githubReleaseConnect } from "@/lib/githubReleaseConnect";

export async function GET(
  request: Request,
  { params }: { params: { releaseName: string } }
) {
  const { searchParams } = new URL(request.url);

  // request.headers?.runtimeVersion ||
  const releaseName = params.releaseName;
  const runtimeVersion = searchParams.get("runtimeVersion");
  const platform = searchParams.get("platform");

  if (!releaseName || !runtimeVersion || !platform) {
    throw new Error("?");
  }

  const release = await githubReleaseConnect().getRelease({
    releaseName,
    runtimeVersion,
    platform,
  });

  if (!release) {
    return Response.json({ message: "Cannot Find Manifest" }, { status: 404 });
  }

  const form = new FormData();

  form.append("manifest", release.stringManifest, {
    contentType: "application/json",
    header: { "content-type": "application/json; charset=utf-8" },
  });

  return new Response(
    Readable.toWeb(Readable.from(form.getBuffer())) as ReadableStream,
    {
      headers: {
        "content-type": `multipart/mixed; boundary=${form.getBoundary()}`,
      },
    }
  );
}