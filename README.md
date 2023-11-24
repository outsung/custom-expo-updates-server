# Custom Expo Updates Server

This is a [custom update server](https://docs.expo.dev/distribution/custom-updates-server) designed for [Expo updates](https://github.com/expo/expo/tree/main/packages/expo-updates).

You can find the client repository at [custom-expo-updates-client](https://github.com/outsung/custom-expo-updates-client).

- Developed using Next.js.
- Fetches data from GitHub Releases.
- Cached every 15 minutes (configurable).
- Assets are stored in Vercel Blob Store.
- Can be deployed directly on Vercel.

## Usage

Deploy on [Vercel](https://vercel.com) by clicking the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/outsung/custom-expo-updates-server)

Add the deployed server address to your Expo updates URL as shown below:

```js
// app.json or app.config.ts
{
  ...
  updates: {
    url: `${server}/api/update/expo/manifests/release/${releaseName}/latest`,
  },
}
```

Note: The `eas update` command is not usable. Copy the two files from the [scripts folder](./scripts) into your Expo project.

For more details on the code, refer to [custom-expo-updates-client](https://github.com/outsung/custom-expo-updates-client).

An alternative command to `eas update` (example):

```console
$ npx expo export
$ ./scripts/upload.sh -d ./dist -v 0.0.1 -r dev ${server}/api/update/expo/upload
```

Executing the `upload.sh` command will add a new release.

## Set .env

Whether deploying on Vercel or running the server locally, configure the .env file appropriately.

Note:
As Vercel Blob Store is used, create a Vercel Blob Store and set `BLOB_READ_WRITE_TOKEN`. For details, refer to [vercel-blob](https://vercel.com/docs/storage/vercel-blob/quickstart#create-a-blob-store).

Required:

- `BLOB_READ_WRITE_TOKEN`: Token for Vercel Blob Store.
- `TOKEN`: Your GitHub token.
- `ACCOUNT`: Your GitHub account name (e.g., `outsung`).
- `REPOSITORY`: Your GitHub repository name (e.g., `custom-expo-updates-server`).

Optional:

- `INTERVAL`: Refreshes the cache every x minutes ([restrictions](https://developer.github.com/changes/2012-10-14-rate-limit-changes/)) (defaults to 15 minutes).
- `PRE`: If defined with a value of `1`, only pre-releases will be cached.

## Reference

- [https://github.com/expo/custom-expo-updates-server](https://github.com/expo/custom-expo-updates-server)
- [https://github.com/wogns3623/expo-updates-server](https://github.com/wogns3623/expo-updates-server)
- [https://github.com/vercel/hazel](https://github.com/vercel/hazel)

## Issues

- Signing for Expo Updates is not yet implemented.
- Make the use of Vercel Blob Store optional instead of mandatory.
