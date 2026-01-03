document.addEventListener("DOMContentLoaded", () => {
  let questions = [];
  let currentIndex = 0;
  let selectedAnswer = null;

  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;

  const MARKS_PER_QUESTION = 2;

  // DOM elements
  const questionText = document.getElementById("questionText");
  const optionsList = document.getElementById("optionsList");
  const nextBtn = document.getElementById("nextBtn");

  if (!questionText || !optionsList || !nextBtn) {
    console.error("Quiz DOM elements not found");
    return;
  }

  /* ---------- FETCH QUESTIONS ---------- */
  fetch("./data.json")
    .then(res => res.json())
    .then(data => {
      questions = data.questions;
      loadQuestion();
      startQuestionTimer();
    })
    .catch(err => {
      console.error("Failed to load questions:", err);
      questionText.textContent = "Error loading quiz questions.";
    });

  /* ---------- LOAD QUESTION ---------- */
  function loadQuestion() {
    if (currentIndex >= questions.length) {
      finishQuiz();
      return;
    }

    selectedAnswer = null;
    resetQuestionTimer();

    const q = questions[currentIndex];
    questionText.textContent = `Q${currentIndex + 1}. ${q.question}`;
    optionsList.innerHTML = "";

    q.options.forEach(opt => {
      const li = document.createElement("li");
      li.textContent = opt;
      li.onclick = () => selectOption(li, opt);
      optionsList.appendChild(li);
    });
  }

  /* ---------- SELECT OPTION ---------- */
  function selectOption(li, option) {
    document.querySelectorAll("#optionsList li")
      .forEach(o => o.classList.remove("selected"));

    li.classList.add("selected");
    selectedAnswer = option;
  }

  /* ---------- NEXT BUTTON ---------- */
  nextBtn.addEventListener("click", moveToNext);

  function moveToNext() {
    evaluateAnswer();
    currentIndex++;
    loadQuestion();
    startQuestionTimer();
  }

  /* ---------- EVALUATE ANSWER ---------- */
  function evaluateAnswer() {
  if (currentIndex >= questions.length) return;

  const q = questions[currentIndex];

  // store user's answer
  q.userAnswer = selectedAnswer ?? "Not Answered";

  if (selectedAnswer === q.correct) {
    score += MARKS_PER_QUESTION;
    correctCount++;
  } else {
    incorrectCount++;
  }
}


  /* ---------- FINISH QUIZ ---------- */
  function finishQuiz() {
  if (localStorage.getItem("quizSubmitted")) return;

  clearInterval(globalInterval);
  clearInterval(questionInterval);

  submitToGoogleForm();
  localStorage.setItem("quizSubmitted", "true");

  let reviewHTML = `
    🎉 <strong>Quiz Completed!</strong><br><br>
    <strong>Score:</strong> ${score} / ${questions.length * MARKS_PER_QUESTION}<br>
    <strong>Correct:</strong> ${correctCount}<br>
    <strong>Incorrect:</strong> ${incorrectCount}
    <hr style="margin:20px 0;border-color:#1f2937;">
    <h3 style="text-align:left;">Question Review:</h3>
  `;

  questions.forEach((q, index) => {
    const isCorrect = q.userAnswer === q.correct;

    reviewHTML += `
      <div style="
        margin-bottom:15px;
        padding:12px;
        border-radius:8px;
        background:${isCorrect ? "#052e16" : "#3f1d1d"};
      ">
        <p><strong>Q${index + 1}:</strong> ${q.question}</p>
        <p>
          <strong>Your Answer:</strong>
          <span style="color:${isCorrect ? "#22c55e" : "#f87171"}">
            ${q.userAnswer}
          </span>
        </p>
        ${
          !isCorrect
            ? `<p><strong>Correct Answer:</strong>
               <span style="color:#22c55e">${q.correct}</span></p>`
            : ""
        }
      </div>
    `;
  });

  questionText.innerHTML = reviewHTML;
  optionsList.innerHTML = "";
  nextBtn.style.display = "none";
}

  /* ---------- GOOGLE FORM SUBMISSION ---------- */
  function submitToGoogleForm() {
    const formURL =
      "https://docs.google.com/forms/d/e/1FAIpQLScKLDNEqdi9cdQyoWtdILv-45TG9KqGHX5ibAuPZA6fh8ghLA/formResponse";

    const totalTimeTaken =
      Math.max(0, (35 * 60) - TOTAL_TIME); // seconds used

    const data = new URLSearchParams({
      "entry.232857783": sessionStorage.getItem("name"),
      "entry.125969604": sessionStorage.getItem("email"),
      "entry.1202587783": sessionStorage.getItem("roll"),
      "entry.682334687": sessionStorage.getItem("college"),
      "entry.280741262": score,
      "entry.1169080535": questions.length,
      "entry.1872387558": `${totalTimeTaken} seconds`
    });

    fetch(formURL, {
      method: "POST",
      mode: "no-cors",
      body: data
    });
  }

  // expose for timer auto-submit
  window.finishQuiz = finishQuiz;
});
/* ---------- ANTI-CHEAT DETECTION ---------- */

let cheatDetected = false;

function autoSubmit(reason) {
  if (cheatDetected) return;
  cheatDetected = true;

  console.warn("Quiz auto-submitted due to:", reason);

  alert(
    "⚠️ Quiz submitted automatically.\nReason: " + reason
  );

  finishQuiz(); // existing function
}

/* TAB SWITCH / MINIMIZE */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    autoSubmit("Tab switch / App switch detected");
  }
});

/* PAGE REFRESH / CLOSE */
window.addEventListener("beforeunload", (e) => {
  autoSubmit("Page refresh or close detected");

  // Required for Chrome to trigger event
  e.preventDefault();
  e.returnValue = "";
});

/* MOBILE / BACKGROUND TAB */
window.addEventListener("pagehide", () => {
  autoSubmit("Page hidden or unloaded");
});
/* ================== ANTI-CHEAT SYSTEM ================== */

let cheatTriggered = false;

function triggerCheat(reason) {
  if (cheatTriggered) return;
  cheatTriggered = true;

  console.warn("Quiz auto-submitted:", reason);

  alert(
    "⚠️ Quiz submitted automatically.\nReason: " + reason
  );

  // Submit quiz data first
  finishQuiz(true); // pass flag
 
  // Redirect AFTER user clicks OK
  setTimeout(() => {
    window.location.href = "/completed.html";
  }, 0);
   submitToGoogleForm();
}



/* ---------- 1. TAB SWITCH / APP SWITCH ---------- */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    triggerCheat("Tab switch or app change detected");
  }
  submitToGoogleForm();
});

/* ---------- 2. PAGE REFRESH / CLOSE ---------- */
window.addEventListener("beforeunload", (e) => {
  triggerCheat("Page refresh or close detected");
  e.preventDefault();
  e.returnValue = "";
  submitToGoogleForm();
});

/* MOBILE / BACKGROUND TAB */
window.addEventListener("pagehide", () => {
  autoSubmit("Page hidden or unloaded");
});

/* ---------- 3. RIGHT CLICK DISABLE ---------- */
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  triggerCheat("Right-click detected");
  submitToGoogleForm();
});

/* ---------- 4. COPY / PASTE / CUT DISABLE ---------- */
["copy", "paste", "cut"].forEach(event => {
  document.addEventListener(event, (e) => {
    e.preventDefault();
    triggerCheat("Copy/Paste action detected");
  });
  submitToGoogleForm();
});

/* ---------- 5. DEVTOOLS DETECTION ---------- */
setInterval(() => {
  const threshold = 160;
  if (
    window.outerWidth - window.innerWidth > threshold ||
    window.outerHeight - window.innerHeight > threshold
  ) {
    triggerCheat("Developer tools detected");
  }
  submitToGoogleForm();
}, 1000);

/* ---------- 6. FULLSCREEN ENFORCEMENT ---------- */
function enterFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  else if (el.msRequestFullscreen) el.msRequestFullscreen();
}

// Enter fullscreen when quiz starts
enterFullscreen();

// Exit fullscreen → auto submit
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    triggerCheat("Exited fullscreen mode");
  }
  submitToGoogleForm();
});


