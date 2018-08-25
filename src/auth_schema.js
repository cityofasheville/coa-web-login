const schema = `
  type LoginResult {
    loggedIn: Boolean
    message: String
    reason: String
  }

  extend type Mutation {
    registerCode (code: String!): LoginResult
    logout: LoginResult
  }
`;
module.exports = schema;
