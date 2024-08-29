module.exports = {
  ci: {
    upload: {
      target: 'temporary',
    },
    collect: {
      staticDistDir: './build',
      staticDirFileDiscoveryDepth: 1,
    },
  },
};
