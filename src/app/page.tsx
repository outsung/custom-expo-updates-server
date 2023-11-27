import dayjs from "dayjs";

import { githubReleaseConnect } from "@/lib/githubReleaseConnect";
import { options } from "@/lib/options";

export default async function Home() {
  const releaseList = await githubReleaseConnect().getReleaseList();
  const { account, repository } = options;

  const github = "https://github.com/outsung/custom-expo-updates-server";
  const githubReleases = `${github}/releases`;

  return (
    <div className="flex flex-col w-full gap-5 py-8">
      <header className="flex justify-center">
        <div className="text-2xl">
          {account}/<span className="font-extrabold">{repository}</span>
        </div>
      </header>

      <div className="flex flex-grow flex-col gap-4 overflow-y-auto p-6">
        {releaseList.map((release) => (
          <a
            href={`${githubReleases}/tag/${`${release.platform}@${release.runtimeVersion}@${release.releaseName}@${release.id}`}`}
            className="flex flex-col shadow-lg bg-gray-50 rounded-md py-2 px-4 gap-4"
            key={release.id}
          >
            <span className="text-xs text-gray-500">#{release.id}</span>
            <div className="flex flex-col">
              <span>
                platform:{" "}
                <span className="font-semibold">{release.platform}</span>
              </span>
              <span>
                releaseName:{" "}
                <span className="font-semibold">{release.releaseName}</span>
              </span>
              <span>
                runtimeVersion:{" "}
                <span className="font-semibold">{release.runtimeVersion}</span>
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {dayjs(release.createdAt).format("YYYY-MM-DD hh:mm")}
            </span>
          </a>
        ))}
      </div>

      <footer className="flex items-start gap-4 justify-between">
        <div className="flex gap-4">
          <a
            className="text-white bg-gradient-to-r from-pink-500 to-orange-500 rounded py-0.5 px-1.5"
            href={github}
          >
            GitHub
          </a>

          <a className="hover:underline" href={githubReleases}>
            All Releases
          </a>
        </div>

        <div className="flex flex-col">
          <span>Reference</span>
          <div className="flex flex-col text-sm">
            <a
              href="https://github.com/expo/custom-expo-updates-server"
              className="hover:underline"
            >
              expo/
              <span className="font-extrabold">custom-expo-updates-server</span>
            </a>
            <a
              href="https://github.com/wogns3623/expo-updates-server"
              className="hover:underline"
            >
              wogns3623/
              <span className="font-extrabold">expo-updates-server</span>
            </a>
            <a
              href="https://github.com/vercel/hazel"
              className="hover:underline"
            >
              vercel/<span className="font-extrabold">hazel</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
