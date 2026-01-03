let TOTAL_TIME = 35 * 60; // 35 minutes
let QUESTION_TIME = 60;  // 1 minute

let globalTimerEl, questionTimerEl;
let globalInterval = null;
let questionInterval = null;

// Initialize DOM safely
document.addEventListener("DOMContentLoaded", () => {
  globalTimerEl = document.getElementById("globalTimer");
  questionTimerEl = document.getElementById("questionTimer");

  startGlobalTimer();
  startQuestionTimer();
});

/* ---------------- GLOBAL TIMER ---------------- */
function startGlobalTimer() {
  if (!globalTimerEl) return;

  globalInterval = setInterval(() => {
    TOTAL_TIME--;
    updateTimer(globalTimerEl, TOTAL_TIME);

    if (TOTAL_TIME <= 0) {
      clearInterval(globalInterval);
      clearInterval(questionInterval);

      alert("⏰ Time is up! Quiz will be submitted.");

      setTimeout(() => {
        finishQuiz();
        // window.location.href = "/timeend.html";
      }, 0);
    }
  }, 1000);
}

/* ---------------- QUESTION TIMER ---------------- */
function startQuestionTimer() {
  resetQuestionTimer();

  let timeLeft = QUESTION_TIME;
  updateTimer(questionTimerEl, timeLeft);

  questionInterval = setInterval(() => {
    timeLeft--;
    updateTimer(questionTimerEl, timeLeft);

    if (timeLeft <= 0) {
      clearInterval(questionInterval);
      moveToNext(); // defined in quiz.js
    }
  }, 1000);
}

/* ---------------- RESET QUESTION TIMER ---------------- */
function resetQuestionTimer() {
  if (questionInterval) {
    clearInterval(questionInterval);
  }
}

/* ---------------- FORMAT TIMER ---------------- */
function updateTimer(el, time) {
  if (!el) return;

  let m = Math.floor(time / 60);
  let s = time % 60;
  el.textContent = `${m}:${s.toString().padStart(2, "0")}`;
}
