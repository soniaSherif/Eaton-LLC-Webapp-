import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
   apiBaseUrl: 'http://localhost:8000/api/'
};
