const backendUrl = "https://todos-backend-fj1d.onrender.com"

// Retrieve all todos
async function getTodoListFromDatabase() {
    try {
        const response = await fetch(`${backendUrl}/get-todos`);
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            return data;
        } else {
            console.log('Failed to fetch todos:', response.status);
            return [];
        }
    } catch (error) {
        console.log(error.message);
        return [];
    }
}

async function initializeTodoList() {
    const todoItemsContainer = document.getElementById("todoItemsContainer");
    const addTodoButton = document.getElementById("addTodoButton");
    const emptyTaskText = document.getElementById("emptyTaskText");

    let todoList = await getTodoListFromDatabase();

    toggleEmptyTaskMessage(todoList.length === 0);

    console.log("Todo list:", todoList);

    for (let todo of todoList) {
        createAndAppendTodo(todo);
    }

    addTodoButton.onclick = onAddTodo;

    // Add todo 
    async function onAddTodo() {
        let userInputElement = document.getElementById("todoUserInput");
        let userInputValue = userInputElement.value.trim();

        if (userInputValue === "") {
            alert("Enter your task");
            return;
        }

        let newTodo = {
            text: userInputValue,
            isChecked: false
        };

        const response = await fetch(`${backendUrl}/add-todo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTodo),
        });

        if (response.ok) {
            await response.json();
            toggleEmptyTaskMessage(false);
            userInputElement.value = "";

            let updatedTodoList = await getTodoListFromDatabase();
            todoItemsContainer.innerHTML = "";

            for (let todo of updatedTodoList) {
                createAndAppendTodo(todo);
            }
        } else {
            console.log("Failed to add todo:", response.status);
        }
    }

    // delete todo
    async function onDeleteTodo(todoId) {
        const response = await fetch(`${backendUrl}/delete-todo/${todoId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            let todoList = await getTodoListFromDatabase();

            todoItemsContainer.innerHTML = "";
            toggleEmptyTaskMessage(todoList.length === 0);

            for (let todo of todoList) {
                createAndAppendTodo(todo);
            }

            console.log("Todo deleted successfully!");
        } else {
            console.log("Failed to delete todo:", response.status);
        }
    }

    // update todo checked or unchecked
    async function onTodoStatusChange(todoId) {
        const checkbox = document.getElementById("checkbox" + todoId);
        const isChecked = checkbox.checked;

        const response = await fetch(`${backendUrl}/update-todo/${todoId}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ isChecked })
        });

        if (response.ok) {
            let labelElement = document.getElementById("label" + todoId);
            if (isChecked) {
                labelElement.classList.add("checked");
            } else {
                labelElement.classList.remove("checked");
            }
            console.log("Todo updated successfully!");
        } else {
            console.log("Failed to update todo:", response.status);
        }
    }

    // creating todolist item
    function createAndAppendTodo(todo) {
        let todoId = todo._id;
        let checkboxId = "checkbox" + todoId;
        let labelId = "label" + todoId;

        let todoElement = document.createElement("li");
        todoElement.classList.add("todo-item-container", "d-flex", "flex-row");
        todoElement.id = todoId;
        todoItemsContainer.appendChild(todoElement);

        let inputElement = document.createElement("input");
        inputElement.type = "checkbox";
        inputElement.id = checkboxId;
        inputElement.checked = todo.isChecked;

        inputElement.onclick = function () {
            onTodoStatusChange(todoId);
        };

        inputElement.classList.add("checkbox-input");
        todoElement.appendChild(inputElement);

        let labelContainer = document.createElement("div");
        labelContainer.classList.add("label-container", "d-flex", "flex-row");
        todoElement.appendChild(labelContainer);

        let labelElement = document.createElement("label");
        labelElement.setAttribute("for", checkboxId);
        labelElement.id = labelId;
        labelElement.classList.add("checkbox-label");
        labelElement.textContent = todo.text;
        labelContainer.appendChild(labelElement);

        if (todo.isChecked) {
            labelElement.classList.add("checked");
        }

        let deleteIconContainer = document.createElement("div");
        deleteIconContainer.classList.add("delete-icon-container");
        labelContainer.appendChild(deleteIconContainer);

        let deleteIcon = document.createElement("i");
        deleteIcon.classList.add("far", "fa-trash-alt", "delete-icon");

        deleteIcon.onclick = function () {
            onDeleteTodo(todoId);
        };

        deleteIconContainer.appendChild(deleteIcon);
    }

    // display empty task text
    function toggleEmptyTaskMessage(isEmpty) {
        if (isEmpty) {
            emptyTaskText.style.display = "block";
        } else {
            emptyTaskText.style.display = "none";
        }
    }
}

initializeTodoList();
