module.exports = {
  ci: {
    upload: {
      target: 'temporary-public-storage',
    },
    collect: {
      staticDistDir: './dist',
      staticDirFileDiscoveryDepth: 1,
    },
  },
};
