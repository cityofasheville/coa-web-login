const registerCode = require('./register_code');
const logout = require('./logout');

const resolvers = {
  Mutation: {
    registerCode,
    logout,
  },
};

module.exports = resolvers;
