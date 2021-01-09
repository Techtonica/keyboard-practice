///////////////////////////////////////////////////////////////////////////////

// returns an array with timing data for a given question number
export async function getHistory(questionNo) {
  try {
    let response = await fetch(`/user/answers/question/${questionNo}`);
    let body = await response.json();
    return body.previousTimingMs;
  } catch (error) {
    console.error(error);
    return [];
  }
}
