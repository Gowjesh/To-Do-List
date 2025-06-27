const taskInput = document.getElementById("taskinput");
const imgFile = document.getElementById("imgfile");
const preview = document.getElementById("preview");
const taskList = document.getElementById("tasklist");
const selectAll = document.getElementById("selectall");
const todoBox = document.getElementById("todobox");
const addTaskButton = document.getElementById("addtask");
const deleteSelectedButton = document.getElementById("deleteselected");

let imageData = "";

function changeTheme(boxColor, bgColor, textColor) {
  todoBox.style.background = boxColor;
  todoBox.style.color = textColor;
  document.body.style.background = bgColor;
  const tasks = taskList.querySelectorAll("li");
  tasks.forEach(task => {
    task.style.background = boxColor === '#000000' ? '#444' : '#f9f9f9';
    task.style.color = textColor;
  });
}

imgFile.addEventListener("change", () => {
  const file = imgFile.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      imageData = e.target.result;
      preview.src = imageData;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

function saveTasksToLocalStorage() {
  const tasks = [];
  taskList.querySelectorAll("li").forEach(li => {
    const taskText = li.querySelector(".main-span").textContent;
    const imageSrc = li.querySelector("img").src;
    const checked = li.querySelector("input[type='checkbox']").checked;
    const subtasks = [];
    li.querySelectorAll(".subtask-list .subtask-item").forEach(subli => {
      subtasks.push({
        text: subli.querySelector("span").textContent,
        checked: subli.querySelector("input[type='checkbox']").checked
      });
    });
    tasks.push({ taskText, imageSrc, checked, subtasks });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
  const stored = JSON.parse(localStorage.getItem("tasks")) || [];
  stored.forEach(task => {
    imageData = task.imageSrc;
    taskInput.value = task.taskText;
    preview.src = imageData;
    preview.style.display = "block";
    addTaskButton.click();

    const addedLi = taskList.lastChild;
    const checkbox = addedLi.querySelector("input[type='checkbox']");
    checkbox.checked = task.checked;
    checkbox.dispatchEvent(new Event("change"));

    const subInput = addedLi.querySelector(".subtask-controls input");
    const subAddBtn = addedLi.querySelector(".subtask-controls button");

    task.subtasks.forEach(subtask => {
      subInput.value = subtask.text.replace(/^\d+\.\s/, "");
      subAddBtn.click();
      const lastSub = addedLi.querySelector(".subtask-list").lastChild;
      const subCB = lastSub.querySelector("input[type='checkbox']");
      subCB.checked = subtask.checked;
      subCB.dispatchEvent(new Event("change"));
    });
  });
}

function checkAllSubtasksComplete(subtaskList, mainCheckbox, mainSpan, taskContainer) {
  const checkboxes = subtaskList.querySelectorAll("input[type='checkbox']");
  const allChecked = [...checkboxes].length > 0 && [...checkboxes].every(cb => cb.checked);
  mainCheckbox.checked = allChecked;
  mainSpan.style.textDecoration = allChecked ? "line-through" : "none";
  if (allChecked) {
    taskContainer.classList.add("task-complete-animation");
    setTimeout(() => taskContainer.classList.remove("task-complete-animation"), 800);
  }
}

addTaskButton.onclick = () => {
  const task = taskInput.value.trim();
  if (task === "" || imageData === "") return;

  const li = document.createElement("li");
  li.style.listStyle = "none";
  li.style.marginBottom = "12px";
  li.style.background = todoBox.style.background === 'rgb(0, 0, 0)' ? '#444' : '#f9f9f9';
  li.style.color = todoBox.style.color;
  li.style.padding = "10px";
  li.style.borderRadius = "8px";
  li.style.display = "flex";
  li.style.flexDirection = "column";
  li.style.gap = "8px";

  const topRow = document.createElement("div");
  topRow.style.display = "flex";
  topRow.style.alignItems = "center";
  topRow.style.gap = "10px";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  const span = document.createElement("span");
  span.textContent = task;
  span.className = "main-span";
  span.style.flex = "1";

  checkbox.onchange = () => {
    span.style.textDecoration = checkbox.checked ? "line-through" : "none";
    saveTasksToLocalStorage();
  };

  const img = new Image();
  img.src = imageData;
  img.width = 70;
  img.height = 70;
  img.style.borderRadius = "8px";
  img.style.objectFit = "cover";

  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.style.background = "#e74c3c";
  delBtn.style.color = "#fff";
  delBtn.style.border = "none";
  delBtn.style.borderRadius = "6px";
  delBtn.style.padding = "6px 10px";
  delBtn.style.cursor = "pointer";
  delBtn.onclick = () => {
    li.remove();
    saveTasksToLocalStorage();
  };

  const subtaskControls = document.createElement("div");
  subtaskControls.className = "subtask-controls";
  const subtaskInput = document.createElement("input");
  subtaskInput.type = "text";
  subtaskInput.placeholder = "Add subtask...";

  const addSubtaskBtn = document.createElement("button");
  addSubtaskBtn.textContent = "+";
  const subtaskList = document.createElement("ol");
  subtaskList.className = "subtask-list";

  let subtaskCount = 0;
  addSubtaskBtn.onclick = () => {
    const val = subtaskInput.value.trim();
    if (val !== "") {
      subtaskCount++;
      const subLi = document.createElement("li");
      subLi.className = "subtask-item";

      const subSpan = document.createElement("span");
      subSpan.textContent = `${subtaskCount}. ${val}`;

      const subCheckbox = document.createElement("input");
      subCheckbox.type = "checkbox";

      subCheckbox.onchange = () => {
        subSpan.style.textDecoration = subCheckbox.checked ? "line-through" : "none";
        checkAllSubtasksComplete(subtaskList, checkbox, span, li);
        saveTasksToLocalStorage();
      };

      subLi.appendChild(subSpan);
      subLi.appendChild(subCheckbox);
      subtaskList.appendChild(subLi);
      subtaskInput.value = "";
      checkAllSubtasksComplete(subtaskList, checkbox, span, li);
      saveTasksToLocalStorage();
    }
  };

  subtaskControls.appendChild(subtaskInput);
  subtaskControls.appendChild(addSubtaskBtn);

  topRow.appendChild(checkbox);
  topRow.appendChild(img);
  topRow.appendChild(span);
  topRow.appendChild(delBtn);

  li.appendChild(topRow);
  li.appendChild(subtaskControls);
  li.appendChild(subtaskList);
  taskList.appendChild(li);

  taskInput.value = "";
  imgFile.value = "";
  preview.src = "";
  preview.style.display = "none";
  imageData = "";
  saveTasksToLocalStorage();
};

deleteSelectedButton.onclick = () => {
  const items = taskList.querySelectorAll("li");
  items.forEach(li => {
    const checkbox = li.querySelector("input[type='checkbox']");
    if (checkbox.checked) li.remove();
  });
  selectAll.checked = false;
  saveTasksToLocalStorage();
};

selectAll.onchange = () => {
  const checkboxes = taskList.querySelectorAll("input[type='checkbox']");
  checkboxes.forEach(cb => {
    cb.checked = selectAll.checked;
    cb.dispatchEvent(new Event("change"));
  });
};

window.onload = loadTasksFromLocalStorage;
