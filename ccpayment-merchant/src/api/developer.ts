/* Thin API seam — mock today, swap to fetch later by editing this module only. */

export interface AppSecretInfo {
  appId: string;
  ipWhitelist: string;
}

export const developerApi = {
  createAppSecret(): Promise<AppSecretInfo> {
    return Promise.resolve({
      appId: '20230626160905167324196156735898981',
      ipWhitelist: '123.456.789.000, 123.456.789.000',
    });
  },
};
