import { GithubReleaseInfo, GithubReleaseInfoEntity } from "@/types";

import { Options } from "./options";

export class GithubRelease {
  private options: Options;

  private cache: GithubReleaseInfoEntity[];
  private cacheUpdatedAt: number | null;

  constructor(options: Options) {
    const { account, repository } = options;
    this.options = options;

    if (!account || !repository) {
      throw new Error("Neither ACCOUNT, nor REPOSITORY are defined");
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

    this.cache = releases
      .sort(
        (a, b) =>
          new Date(a.published_at).getTime() -
          new Date(b.published_at).getTime()
      )
      .map((release) => {
        const [platform, runtimeVersion, releaseName, id] =
          release.tag_name.split("@");
        return {
          id,
          platform,
          releaseName,
          runtimeVersion,
          stringManifest: release.body,
          createdAt: release.published_at,
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

  public async getReleaseList() {
    const { refreshCache, isOutdated, cacheUpdatedAt } = this;

    if (!cacheUpdatedAt || isOutdated()) {
      await refreshCache();
    }

    return this.cache;
  }

  public async getRelease({
    id,
    platform,
    releaseName,
    runtimeVersion,
  }: Pick<
    GithubReleaseInfoEntity,
    "platform" | "releaseName" | "runtimeVersion"
  > & { id?: string }) {
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

  public async createRelease({
    id,
    platform,
    releaseName,
    runtimeVersion,
    stringManifest,
  }: Omit<GithubReleaseInfoEntity, "createdAt">) {
    const { account, repository, token } = this.options;
    const repo = account + "/" + repository;
    const url = `https://api.github.com/repos/${repo}/releases`;

    const headers: HeadersInit = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    if (token && typeof token === "string" && token.length > 0) {
      headers.Authorization = `Bearer ${token}`;
    }

    const tagName = `${platform}@${runtimeVersion}@${releaseName}@${id}`;
    const body = JSON.stringify({
      tag_name: tagName,
      name: tagName,
      body: stringManifest,
      draft: false,
      prerelease: false, // Set to true if it's a pre-release
    });

    const response = await fetch(url, { method: "POST", headers, body });

    if (response.status !== 201) {
      throw new Error(
        `GitHub API responded with ${response.status} for url ${url}`
      );
    }

    const createdRelease = await response.json();

    this.cache.unshift({
      id,
      platform,
      releaseName,
      runtimeVersion,
      stringManifest,
      createdAt: new Date().toString(),
    });

    return createdRelease;
  }
}
