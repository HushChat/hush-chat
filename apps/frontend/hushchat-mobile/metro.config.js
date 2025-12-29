const { getDefaultConfig } = require("@expo/metro-config");

const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("wasm");

config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");

    return middleware(req, res, next);
  };
};

module.exports = withNativeWind(config, { input: "./global.css" });
