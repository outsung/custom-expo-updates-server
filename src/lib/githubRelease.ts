import { GithubReleaseInfo, GithubReleaseInfoEntity } from "@/types";

import { Options } from "./options";

export class GithubRelease {
  private options: Options;

  private cache: GithubReleaseInfoEntity[];
  private cacheUpdatedAt: number | null;

  constructor(options: Options) {
    const { account, repository, token, url } = options;
    this.options = options;

    if (!account || !repository) {
      throw new Error("Neither ACCOUNT, nor REPOSITORY are defined");
    }

    if (token && !url) {
      throw new Error(
        "Neither VERCEL_URL, nor URL are defined, which are mandatory for private repo mode"
      );
    }

    this.cache = [];
    this.cacheUpdatedAt = null;

    this.refreshCache = this.refreshCache.bind(this);
    this.isOutdated = this.isOutdated.bind(this);
    this.getRelease = this.getRelease.bind(this);
  }

  private async refreshCache() {
    const { account, repository, pre, token } = this.options;
    const repo = account + "/" + repository;
    const url = `https://api.github.com/repos/${repo}/releases?per_page=100`;
    const headers: HeadersInit = { Accept: "application/vnd.github.preview" };

    if (token && typeof token === "string" && token.length > 0) {
      headers.Authorization = `token ${token}`;
    }

    const response = await fetch(url, { headers });
    if (response.status !== 200) {
      throw new Error(
        `GitHub API responded with ${response.status} for url ${url}`
      );
    }

    const data = (await response.json()) as GithubReleaseInfo[];

    if (!Array.isArray(data) || data.length === 0) {
      return;
    }

    const releases = data.filter((item) => {
      const isPre = Boolean(pre) === Boolean(item.prerelease);
      return !item.draft && isPre;
    });

    if (!releases || !releases.length) {
      return;
    }

    this.cache = releases.map((release) => {
      const [platform, runtimeVersion, releaseName, id] =
        release.tag_name.split("@");
      return {
        id,
        platform,
        releaseName,
        runtimeVersion,
        stringManifest: release.body,
      };
    });
    this.cacheUpdatedAt = Date.now();
  }

  private isOutdated() {
    const { cacheUpdatedAt, options } = this;
    const { interval = 15 } = options;

    if (
      cacheUpdatedAt &&
      Date.now() - cacheUpdatedAt > 60000 * Number(interval)
    ) {
      return true;
    }

    return false;
  }

  public async getRelease({
    id,
    platform,
    releaseName,
    runtimeVersion,
  }: Omit<GithubReleaseInfoEntity, "stringManifest" | "id"> & { id?: string }) {
    const { refreshCache, isOutdated, cacheUpdatedAt } = this;

    if (!cacheUpdatedAt || isOutdated()) {
      await refreshCache();
    }

    return this.cache.find((c) => {
      return (
        platform === c.platform &&
        releaseName === c.releaseName &&
        runtimeVersion === c.runtimeVersion &&
        (id ? id === c.id : true)
      );
    });
  }

}
