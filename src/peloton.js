function isSessionValid() {
  try {
    var session_id = getSessionId();
    var response = UrlFetchApp.fetch("https://api.onepeloton.com/api/me", {
      method: "GET",
      contentType: "application/json",
      muteHttpExceptions: true,
      headers: {
        cookie: `peloton_session_id=${session_id}`,
      },
    });

    Logger.log(
      "isSessionValid",
      response.getResponseCode() === 200,
      session_id
    );

    return response.getResponseCode() === 200;
  } catch (e) {
    Logger.log(new Error("SESSION ERROR"), e);
    return false;
  }
}

function authenticateUserWithCredentials({ username, password }) {
  const payload = {
    username_or_email: username,
    password: password,
  };
  try {
    const response = UrlFetchApp.fetch(
      "https://api.onepeloton.com/auth/login",
      {
        method: "POST",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
      }
    );
    if (response.getResponseCode() !== 200) throw "INVALID_CREDENTIALS";
    const responseData = JSON.parse(response.getContentText());
    setUserData(responseData);
    return true;
  } catch (e) {
    Logger.log(new Error("AUTH_WITH_CREDENTIALS_FAILED", e));
    return false;
  }
}

async function fetchWorkoutHistory() {
  try {
    var user_id = await getUserId();
    var session_id = await getSessionId();
    var url = `https://api.onepeloton.com/api/user/${user_id}/workout_history_csv?timezone=America/New_York`;
    var response = UrlFetchApp.fetch(url, {
      method: "GET",
      contentType: "application/json",
      muteHttpExceptions: true,
      headers: {
        cookie: `peloton_session_id=${session_id}`,
      },
    });
    if (response.getResponseCode() !== 200) throw "FETCHING_DATA_FAILED";
    return response.getContentText();
  } catch (e) {
    Logger.log(e);
    return;
  }
}
