module.exports = {
  checkLogin: require('./src/check_login'),
  decodeToken: require('./src/decode_token'),
  getPublicKeys: require('./src/get_public_keys'),
  registerCode: require('./src/register_code'),
  graphql: {
    schema: require('./src/auth_schema'),
    resolvers: require('./src/auth_resolvers'),
  }
};

