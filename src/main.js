const userProperties = PropertiesService.getUserProperties();
const scriptProperties = PropertiesService.getScriptProperties();

const USERNAME = "peloton_username";
const PASSWORD = "peloton_password";
const PELOTON_SESSION_ID = "peloton_session_id";
const PELOTON_USER_ID = "peloton_user_id";
const FETCH_STRATEGY = "ALL"; // choose one between "ALL" or "DELTAS";

async function main() {
  try {
    if (isAuthValid) {
      const workoutSheet = getWorkoutsFile();
      const workoutData = await fetchWorkoutHistory();
      const parsedData = Utilities.parseCsv(workoutData);
      switch (FETCH_STRATEGY) {
        case "ALL":
          workoutSheet.clear();
          break;
        case "DELTAS":
          const workoutCount = workoutSheet.getLastRow();
          parsedData.splice(0, workoutCount);
          break;
        default:
      }
      parsedData.forEach((row) => workoutSheet.appendRow(row));
    }
  } catch (e) {
    console.error(e);
  }
}

function getWorkoutsFile() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  } catch (e) {
    console.error(e);
  }
}

async function isAuthValid() {
  try {
    const creds = await getUserCredentials();
    if (!isSessionValid() || !authenticateUserWithCredentials(creds))
      throw "AUTHENTICATION_FAILED";
    Logger.log("USER_AUTHENTICATED_SUCCESFULLY");
  } catch (e) {
    Logger.log(new Error("AUTH ERROR"), e);
    return false;
  }
}

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

/****
 * USER PROPERTIES HELPERS
 ****/
function setUserData({ session_id, user_id }) {
  userProperties.setProperty(PELOTON_SESSION_ID, session_id);
  userProperties.setProperty(PELOTON_USER_ID, user_id);
  Logger.log("userProperties set correctly", userProperties.getProperties());
}

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
