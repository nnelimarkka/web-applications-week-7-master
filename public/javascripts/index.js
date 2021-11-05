

if (document.readyState !== "loading") {
    initializeCodeIndex();
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      initializeCodeIndex();
    });
  }
  
function initializeCodeIndex() {
    let token = localStorage.getItem("auth_token");
    if (!token) return;
    let button = document.createElement("button");
    
    fetch("/api/user/email", {
        method: "GET",
        headers: {
            "authorization": "Bearer " + token
        }
    })
        .then((response) => response.text())
        .then((email) => {
            if(email === 'Forbidden') return;
            let secretText = document.getElementById("secrets");
            secretText.innerHTML = email;
            
            button.innerHTML = 'Logout';
            button.id = 'logout';
            button.classList.add("class", "btn");
            secretText.appendChild(button);
        })
        .catch((e) => {
            console.log("error" + e);
        });
    
    button.addEventListener("click", function() {
        localStorage.removeItem("auth_token");
        window.location.href = "/";
    });

    fetch("/api/todos/todo", {
        method: "POST",
        headers: {
            "authorization": "Bearer " + token
        }
    })
        .then((response) => response.json())
        .then((todos) => {
            if(todos.message) return;
            let todoList = document.getElementById("todo-content");
            for(let i = 0; i < todos.items.length; i++) {
                let listItem = document.createElement("li");
                listItem.innerHTML = todos.items[i];
                todoList.appendChild(listItem);
            }
        })
        .catch((e) => {
            console.log("error" + e);
        });
    
    document.getElementById("todo-form").addEventListener("submit", (event) => {
        event.preventDefault();

        let todo = document.getElementById("todo-input").value;

        console.log(todo);

        let data = {"items": [todo]};

        fetch("/api/todos", {
            method: "POST",
            headers: {
                "authorization": "Bearer " + token,
                "content-type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then((response) => response.text())
            .then((message) => {
                if(message === 'ok') return;
                else alert("error in adding todo");
            })
    })

} 
