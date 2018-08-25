
const logout = function (parent, args, context) {
  context.cache.del(context.req.session.id);
  context.req.session.email = undefined;
  return Promise.resolve({ loggedIn: false, message: 'Goodbye', reason: 'No reason' });
};

module.exports = logout;
