const {
  INTERVAL: interval,
  ACCOUNT: account,
  REPOSITORY: repository,
  PRE: pre,
  TOKEN: token,
} = process.env;

export const options = { interval, account, repository, pre, token };
export type Options = typeof options;
