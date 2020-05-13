const userProperties = PropertiesService.getUserProperties();
const scriptProperties = PropertiesService.getScriptProperties();

const USERNAME = "peloton_username";
const PASSWORD = "peloton_password";
const PELOTON_SESSION_ID = "peloton_session_id";
const PELOTON_USER_ID = "peloton_user_id";
const FETCH_STRATEGY = "LAST_5"; // choose one between "ALL", "DELTAS" or "LAST_5";

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
        case "LAST_5":
          workoutSheet.deleteRows(workoutSheet.getLastRow() -4, 5);
          const newLastRow = workoutSheet.getLastRow();
          parsedData.splice(0, newLastRow);
          break;
        default:
          break;
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
