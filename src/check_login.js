// const cache = require('../cache/cache');
const decodeToken = require('./decode_token');
const jose = require('node-jose');
const axios = require('axios');
const qs = require('qs');

const checkLogin = function (req, cacheData = null, cache) {
  if (req.session) req.session.loggedIn =false;
  if (cacheData) {
    // get the kid from the headers prior to verification
    let header = JSON.parse(jose.util.base64url.decode(cacheData.id_token.split('.')[0]));
    kid = header.kid;

    return decodeToken(kid, process.env.appClientId, cacheData.id_token, 'test', cache)
    .then(result => {
      if (result.status == 'expired') {
        // for refresh see https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html
        const refreshData = {
          grant_type: 'refresh_token',
          scope: 'email openid profile',
          client_id: process.env.appClientId,
          refresh_token: cacheData.refresh_token,
          redirect_uri: '',
        };
        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
        };      
        return axios({
          method: 'post',
          url: process.env.cognitoOauthUrl,
          data: qs.stringify(refreshData),
          headers,
        })
        .then((response) => {
          if (response.status == 200) {
            // get the kid from the headers prior to verification
            const sections = response.data.id_token.split('.');
            header = JSON.parse(jose.util.base64url.decode(sections[0]));
            kid = header.kid;
            decodeToken(kid, process.env.appClientId, response.data.id_token, 'refresh_token', cache)
            .then(result => {
              if (result.status !== 'ok') throw new Error(`Error decoding token: ${result.status}`);
              const claims = result.claims;
              req.session.loggedIn =true;
              req.session.loginProvider = result.identities[0].providerType;
              if (cache) cache.store(req.session.id,
                Object.assign(cacheData, {
                  id_token: response.data.id_token,
                  access_token: response.data.access_token,
                }));
            });
          }      
        });
      } else if (result.status == 'ok') {
        req.session.loggedIn =true;
        req.session.loginProvider = result.identities[0].providerType;
      } else {
        throw new Error(`Login expired - you will need to log in again (Status: ${result.status})`);
      }
      return Promise.resolve(req.session.loggedIn);
    })
    .catch(err => {
      if (err) console.log(`Error checking login: ${err}`);
    });
  }
  return Promise.resolve(false);
};
module.exports = checkLogin;
