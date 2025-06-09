require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  console.log(`starting notarizing`, context)

  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  console.log(`doing notarize`)
  const notarizeResult = await notarize({
    tool: 'notarytool',
    appBundleId: 'cz.siteone.crawler',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASS,
    teamId: process.env.APPLE_TEAM_ID,
  });

  console.log(`notarize complete`)

  return notarizeResult
};
