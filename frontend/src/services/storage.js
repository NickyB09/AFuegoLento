const ACCESS_TOKEN_KEY = 'afuegolento_access_token';
const REFRESH_TOKEN_KEY = 'afuegolento_refresh_token';
const USER_KEY = 'afuegolento_user';

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

export const storage = {
  getAuth() {
    if (!canUseStorage()) return null;

    const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
    const userRaw = window.localStorage.getItem(USER_KEY);

    if (!accessToken || !refreshToken || !userRaw) return null;

    try {
      return {
        accessToken,
        refreshToken,
        user: JSON.parse(userRaw),
      };
    } catch {
      return null;
    }
  },

  setAuth({ accessToken, refreshToken, user }) {
    if (!canUseStorage()) return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearAuth() {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
};
