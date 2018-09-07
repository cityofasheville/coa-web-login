const axios = require('axios');
const jose = require('node-jose');
const decodeToken = require('./decode_token');
const getPublicKeys = require('./get_public_keys');
const qs = require('qs');

const registerCode = function (parent, args, context) {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  // const region = 'us-east-1';
  // const userpoolId = 'us-east-1_hBNUnqaVB';
  // const appClientId = '2uu574tlad2ajk5hmj94fnjeva';

  const data = {
    grant_type: 'authorization_code',
    scope: 'email openid profile',
    client_id: process.env.appClientId,
    code: args.code,
    redirect_uri: 'http://localhost:3000/xyz',
  };

  let sections = null;
  let header = null;
  let kid = null;
  let token = null;

  // Code adapted from https://github.com/awslabs/aws-support-tools/blob/master/Cognito/decode-verify-jwt/decode-verify-jwt.js

  return axios({
    method: 'post',
    url: process.env.cognitoOauthUrl,
    data: qs.stringify(data),
    headers,
  })
  .then((response) => {
    token = response.data.id_token;
    context.cache.store(context.req.session.id, {
      id_token: token,
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
    });
    sections = token.split('.');
    // get the kid from the headers prior to verification
    header = JSON.parse(jose.util.base64url.decode(sections[0]));
    kid = header.kid;
    return decodeToken(kid, process.env.appClientId, token)
    .then(result => {
      if (result.status !== 'ok') throw new Error(`Error decoding token: ${result.status}`);
      const claims = result.claims;
      if (context.session) {
        context.session.email = claims.email;
      }
      return Promise.resolve({ loggedIn: true, message: 'Hi there', reason: 'No reason' });
    });

    throw new Error('Bad response getting Cognito keys');
  })
  .catch(error => {
    console.log(`Back with an error ${error}`);
  });
};

module.exports = registerCode;
