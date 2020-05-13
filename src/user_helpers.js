function getSessionId() {
  const up = userProperties.getProperties();
  if (!up[PELOTON_SESSION_ID]) throw "NO_SESSION_FOUND";
  return up[PELOTON_SESSION_ID];
}

function getUserId() {
  const up = userProperties.getProperties();
  if (!up[PELOTON_USER_ID]) throw "NO_USER_ID_FOUND";
  return up[PELOTON_USER_ID];
}

function getUserCredentials() {
  const sp = scriptProperties.getProperties();
  if (!sp[USERNAME] || !sp[PASSWORD])
    throw "NO_USER_CREDENTIALS_FOUND. Please set your credentials on the script properties";
  return {
    username: sp[USERNAME],
    password: sp[PASSWORD],
  };
}

function setUserData({ session_id, user_id }) {
    userProperties.setProperty(PELOTON_SESSION_ID, session_id);
    userProperties.setProperty(PELOTON_USER_ID, user_id);
    Logger.log("userProperties set correctly", userProperties.getProperties());
  }
  