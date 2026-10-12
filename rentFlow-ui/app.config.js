// Extends app.json. The Google Sign-In config plugin is only needed for
// iOS (URL scheme from the iOS OAuth client), so it is added once that
// client exists. Android needs no plugin.
module.exports = ({ config }) => {
  const iosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME;

  return {
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      ...(iosUrlScheme
        ? [["@react-native-google-signin/google-signin", { iosUrlScheme }]]
        : []),
    ],
  };
};
