const timer = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  sessions: 0,
};

let interval;

const buttonSound = new Audio("button-sound.mp3");
const mainButton = document.getElementById("js-btn");
mainButton.addEventListener("click", () => {
  buttonSound.play();
  const { action } = mainButton.dataset;
  if (action === "start") {
    startTimer();
  } else {
    stopTimer();
  }
});

const resetButton = document.getElementById("js-reset-btn");
resetButton.addEventListener("click", () => {
  buttonSound.play();
  switchMode(timer.mode);
  stopTimer();
});

const modeButtons = document.querySelector("#js-mode-buttons");
modeButtons.addEventListener("click", handleMode);

function getRemainingTime(endTime) {
  const currentTime = Date.parse(new Date());
  const difference = endTime - currentTime;

  const total = Number.parseInt(difference / 1000, 10);
  const minutes = Number.parseInt((total / 60) % 60, 10);
  const seconds = Number.parseInt(total % 60, 10);

  return {
    total,
    minutes,
    seconds,
  };
}

function startTimer() {
  let { total } = timer.remainingTime;
  const endTime = Date.parse(new Date()) + total * 1000;

  if (timer.mode === "pomodoro") timer.sessions++;

  mainButton.dataset.action = "stop";
  mainButton.textContent = "stop";
  mainButton.classList.add("active");

  interval = setInterval(function () {
    timer.remainingTime = getRemainingTime(endTime);
    updateClock();

    total = timer.remainingTime.total;
    if (total <= 0) {
      clearInterval(interval);

      switch (timer.mode) {
        case "pomodoro":
          if (timer.sessions % timer.longBreakInterval === 0) {
            switchMode("longBreak");
          } else {
            switchMode("shortBreak");
          }
          break;
        default:
          switchMode("pomodoro");
      }
      document.querySelector(`[data-sound="${timer.mode}"]`).play();
      startTimer();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(interval);

  mainButton.dataset.action = "start";
  mainButton.textContent = "Start";
  mainButton.classList.remove("active");

  // Reset the clock display
  timer.remainingTime = {
    total: timer[timer.mode] * 60,
    minutes: timer[timer.mode],
    seconds: 0,
  };

  updateClock();
}

function updateClock() {
  const { remainingTime } = timer;
  const minutes = `${remainingTime.minutes}`.padStart(2, "0");
  const seconds = `${remainingTime.seconds}`.padStart(2, "0");

  const min = document.getElementById("js-minutes");
  const sec = document.getElementById("js-seconds");
  min.textContent = minutes;
  sec.textContent = seconds;

  const text = timer.mode === "pomodoro" ? "Pomodoro" : "Take a break!";
  document.title = `${minutes}:${seconds} — ${text}`;
}

function switchMode(mode) {
  document.body.style.transition = "background-color 1s ease";

  document.body.style.backgroundColor = `var(--${mode})`;

  setTimeout(() => {
    document.body.style.transition = "none";
  }, 1000);

  timer.mode = mode;
  timer.remainingTime = {
    total: timer[mode] * 60,
    minutes: timer[mode],
    seconds: 0,
  };

  document
    .querySelectorAll("button[data-mode]")
    .forEach((e) => e.classList.remove("active"));
  document.querySelector(`[data-mode="${mode}"]`).classList.add("active");
  document.body.style.backgroundColor = `var(--${mode})`;

  updateClock();
}

function handleMode(event) {
  const { mode } = event.target.dataset;

  if (!mode) return;

  switchMode(mode);
  stopTimer();
}

document.addEventListener("DOMContentLoaded", () => {
  switchMode("pomodoro");
});

document.addEventListener("DOMContentLoaded", function () {
  const tasks = [];

  const taskForm = document.getElementById("task-form");
  const taskInput = document.getElementById("task-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskList = document.getElementById("task-list");

  taskForm.addEventListener("submit", function (event) {
    event.preventDefault();
    handleAddTask();
  });

  function handleAddTask() {
    console.log(tasks);

    const text = taskInput.value.trim();
    if (text !== "") {
      const id = generateUniqueId();
      const newTask = { id, text, style: "none" };
      tasks.unshift(newTask);
      renderTask(newTask);
      taskInput.value = "";
    }
  }

  function renderTask(task) {
    const li = document.createElement("li");
    li.className =
      "my-3 flex w-80 items-center bg-gray-200 px-8 py-3 text-xl font-medium text-black rounded-md";
  
    const p = document.createElement("p");
    p.className = "flex-1 mr-4 cursor-pointer truncate text-2xl";
    p.textContent = task.text;
    p.style.textDecoration =
      task.style === "underline" ? "line-through" : "none";
    p.addEventListener("click", () => toggleUnderline(task.id));
  
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = `
          <svg xmlns='http://www.w3.org/2000/svg' width='25' height='25' viewBox='0 0 16 12'>
            <path fill='none' stroke='black' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5'
              d='m11.25 4.75l-6.5 6.5m0-6.5l6.5 6.5' />
          </svg>
        `;
    deleteBtn.addEventListener("click", () => deleteTask(task.id));
  
    li.appendChild(p);
    li.appendChild(deleteBtn);
    taskList.prepend(li);
  }
  

  function toggleUnderline(id) {
    tasks.forEach((task) => {
      if (task.id === id) {
        task.style = task.style === "underline" ? "none" : "underline";
        renderTasks();
      }
    });
  }

  function deleteTask(id) {
    const index = tasks.findIndex((task) => task.id === id);
    if (index !== -1) {
      tasks.splice(index, 1);
      renderTasks();
    }
  }

  function renderTasks() {
    taskList.innerHTML = "";
    tasks.forEach(renderTask);
  }

  function generateUniqueId() {
    return "_" + Math.random().toString(36).substr(2, 9);
  }
});
