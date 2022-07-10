// get variables
const themeBtn = document.querySelector(".toggle");
const headerBG = document.querySelector(".header");
const footer = document.querySelector("footer");
const addTask = document.querySelector(".create-todo");
const taskContainer = document.querySelector(".js-tasks");
const allTodosCont = document.querySelector(".js-all-todos");
const input = document.querySelector(".task-create .task-name");

const todosTotal = document.querySelector(".todo-total");

// create new custom event
const eventUpdateTodos = new Event("updateTodos");

// array to store all the tasks
const td = "todos";
const dm = "darkMode";
let todos = loadStorage(td) ? loadStorage(td) : [];
let darkMode = loadStorage(dm) ? loadStorage(dm) : { state: true };

// !STAR EVENT LISTENERS

// TODO: Click to change theme
themeBtn.addEventListener("click", evChangeTheme);

// TODO: Click to create task
addTask.addEventListener("click", evCreateTask);
input.addEventListener("keydown", enterCreateTask);

// TODO: Mark as completed and Delete task
allTodosCont.addEventListener("click", handleTaskContainer);

// TODO: Click to sort
footer.addEventListener("click", evSortTodos);

// TODO: ALL CUSTOM EVENT
taskContainer.addEventListener("updateTodos", () => {
	printTodos(todos);
});

// !END EVENT LISTENERS

// TODO: all the functions

function evSortTodos(e) {
	const selection = ["All", "Completed", "Active"];
	const sortMethod = e.target.textContent;
	if (!selection.includes(sortMethod)) return;

	let newTodos = [];

	switch (sortMethod) {
		case "All":
			newTodos = [...todos];
			break;
		case "Active":
			newTodos = todos.filter(completed => completed.finish === false);
			break;
		case "Completed":
			newTodos = todos.filter(completed => completed.finish === true);
			break;
		default:
	}
	printTodos(newTodos);
}

function handleTaskContainer(e) {
	const target = e.target;
	const closest = target.closest("button");
	const clear = e.target.parentNode.classList.contains("clear");

	// Mark as completed
	if (target.type === "checkbox") {
		changeState(target);
	}
	// sort
	else if (clear) {
		deleteTask(clear);
	}
	// Delete task
	else if (closest) {
		deleteTask(closest.parentNode);
	}
	return;
}

function deleteTask(target) {
	todos =
		typeof target === "boolean"
			? (todos = todos.filter(e => e.finish === false))
			: todos.filter(e => e.id !== target.dataset.id);

	if (!todos.length) {
		allTodosCont.classList.remove("show");
		taskContainer.style.borderColor = "transparent";
		footer.classList.remove("show");
	}
	taskContainer.dispatchEvent(eventUpdateTodos);
}

function changeState(target) {
	const parent = target.parentNode;
	if (target.checked === true) {
		target.removeAttribute("checked");
	} else {
		target.setAttribute("checked", true);
	}

	for (const task of todos) {
		if (task.id === parent.dataset.id) {
			task.finish = task.finish === false ? true : false;
		}
	}
	taskContainer.dispatchEvent(eventUpdateTodos);
}

function evChangeTheme() {
	darkMode.state = darkMode.state === false ? true : false;
	displayMode();
}

function displayMode() {
	const root = document.documentElement.classList;

	if (darkMode.state === false) {
		root.remove("light");
		themeBtn.src = "./images/icon-sun.svg";
		headerBG.src = "./images/bg-mobile-dark.jpg";
	} else {
		root.add("light");
		themeBtn.src = "./images/icon-moon.svg";
		headerBG.src = "./images/bg-mobile-light.jpg";
	}
	updateStorage(dm);
}

function enterCreateTask(e) {
	if (e.key !== "Enter") return;
	evCreateTask(e);
}

function evCreateTask(e) {
	const task = !e.key ? e.currentTarget.nextElementSibling.value : e.target.value;

	if (!task || task === " ") return;
	const newTask = {
		id: new Date().getTime().toString(),
		task: `${task}`,
		finish: false,
	};
	todos.push(newTask);
	printTodos(todos);
}

function loadStorage(key) {
	if (key === "darkMode") {
		return JSON.parse(localStorage.getItem("fem-aka-todos-dark"));
	}
	return JSON.parse(localStorage.getItem("fem-aka-todos"));
}

function updateStorage(key) {
	if (key === "darkMode") {
		return localStorage.setItem("fem-aka-todos-dark", JSON.stringify(darkMode));
	}
	return localStorage.setItem("fem-aka-todos", JSON.stringify(todos));
}

function printTodos(arr) {
	todosTotal.textContent = `${arr.length} items left`;
	if (!arr.length) {
		allTodosCont.classList.remove("show");
		footer.classList.remove("show");
		taskContainer.style.borderColor = "transparent";
	}

	if (arr.length) {
		allTodosCont.classList.add("show");
		footer.classList.add("show");
	}

	taskContainer.innerHTML = "";
	let html = ``;
	arr.forEach(item => {
		html += `  
		<div draggable="true" class="task draggable" data-id="${item.id}">
		<input type="checkbox" ${item.finish === true ? "checked" : ""}></input>
		<span class="task-name">${item.task}</span>
		<button type="button" class="delete"><img src="./images/icon-cross.svg" alt=""></button>
		</div>`;
	});

	taskContainer.insertAdjacentHTML("afterbegin", html);
	updateStorage(td);
	dragFunction();
}

function dragFunction() {
	const draggables = document.querySelectorAll(".draggable");
	let move;

	draggables.forEach(draggable => {
		draggable.addEventListener("dragstart", dragStart);
		draggable.addEventListener("dragend", dragEnd);
		draggable.addEventListener("dragover", dragOver);
		// draggable.addEventListener("dragenter", dragEnter);
		// draggable.addEventListener("dragleave", dragLeave);
		draggable.addEventListener("drop", dragDrop);
	});
}

function dragStart() {
	move = this;
	// console.log(`this`, this);
	// console.log(`move`, move);

	// TODO: append css to dim the background
}

function dragEnd() {
	// console.log("Start");
	// TODO: don't know yet
}

function dragOver(e) {
	e.preventDefault();
}

// function dragEnter() {
// 	console.log("Enter");
// }

// function dragLeave() {
// 	console.log("Leave");
// }

function dragDrop() {
	// const tmp = this.parentNode.insertBefore(document.createElement("p"), this);
	const thisID = this.dataset.id;
	const grabID = move.dataset.id;
	let thisIndex;
	let grabIndex;
	let thisArr;
	let grabArr;

	for (const item of todos) {
		if (item.id === thisID) {
			thisIndex = todos.indexOf(item);
			thisArr = todos[thisIndex];
		} else if (item.id === grabID) {
			grabIndex = todos.indexOf(item);
			grabArr = todos[grabIndex];
		}
	}

	//This method is used to swap the DOM with the help of a temporary DOM
	// move.parentNode.insertBefore(this, move);
	// tmp.parentNode.insertBefore(move, tmp);
	// tmp.parentNode.removeChild(tmp);
	todos.splice(thisIndex, 1, grabArr);
	todos.splice(grabIndex, 1, thisArr);
	taskContainer.dispatchEvent(eventUpdateTodos);
	console.log(todos);
}

displayMode();
printTodos(todos);
// Your users should be able to:

// - View the optimal layout for the app depending on their device's screen size
// !DONE! - See hover states for all interactive elements on the page
// !DONE! - Add new todos to the list
// !DONE! - Mark todos as complete
// !DONE! - Delete todos from the list
// !DONE! - Filter by all/active/complete todos
// !DONE! - Clear all completed todos
// !DONE! - Toggle light and dark mode
// !DONE Drag and drop to reorder items on the list
