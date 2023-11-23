const {
  INTERVAL: interval,
  ACCOUNT: account,
  REPOSITORY: repository,
  PRE: pre,
  TOKEN: token,
  URL: PRIVATE_BASE_URL,
  VERCEL_URL,
} = process.env;

const url = VERCEL_URL || PRIVATE_BASE_URL;

export const options = { interval, account, repository, pre, token, url };
export type Options = typeof options;
