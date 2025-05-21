(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/';
    }

    try {
        const playloadBase64 = token.split('.')[1];
        const playloadJson = atob(playloadBase64);
        const playload = JSON.parse(playloadJson);
        const userId = playload.sub;

        const res = await fetch(`https://sculpin-pro-newly.ngrok-free.app/users/get/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true"
            }
        });

        if (!res.ok) {
            window.location.href = '/';
        }

        const data = await res.json();
        const role = data.role;

        if (role !== 'parent') {
            window.location.href = '/';
        }

        document.querySelector('main').style.display = 'flex';

    } catch (e) {
        window.location.href="/";
    }

    const resTasks = await fetch(`https://sculpin-pro-newly.ngrok-free.app/tasks/get`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
        }
    })

    if (!resTasks.ok) {
        alert('No se han podido cargar las tareas')
    }

    const tasks = await resTasks.json();
    const tareas = tasks.tasks;

    const lista = document.querySelector('.main-list');
    lista.innerHTML = '';

    tareas.forEach(tarea => {
        const li = document.createElement('li');

        li.dataset.taskId = tarea.id;
        li.className = `main-list__item`;
        li.innerHTML = `
            <div class="main-list__item-content">
                <h3 class="main-list__item-content__title">${tarea.title}</h3>
                <p class="main-list__item-content__description">${tarea.description}</p>
            </div>
            <span class="main-list__item-reward">${tarea.reward.toFixed(2)}€</span>
            <button class="main-list__item-modify">Modificar</button>
            <button class="main-list__item-delete">Eliminar</button>
        `
        lista.appendChild(li);
    })

    const taskDelete = document.querySelectorAll('.main-list__item-delete');
    taskDelete.forEach(item => {
        item.addEventListener('click', async() => {
            try {
                const confirmDelete = confirm('¿Estás seguro de que quieres eliminar esta tarea?');

                if (confirmDelete) {
                    if (!token) {
                        window.location.href = '/';
                    }
    
                    const taskId = item.parentElement.dataset.taskId;
    
                    const res = await fetch (`https://sculpin-pro-newly.ngrok-free.app/tasks/delete/${taskId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                            "ngrok-skip-browser-warning": "true"
                        },
                    });
    
                    if (!res.ok) {
                        alert('No se ha podido eliminar la tarea')
                    } else {
                        window.location.reload();
                    }    
                }
            } catch (e) {
                console.error('Error al eliminar la tarea', e)
            }
        });
    });

    const addTaskButton = document.querySelector('.main-add');
    const addTaksClose = document.querySelector('.main-form__close');
    const addTaskForm = document.querySelector('.main-form');
    const addTaskSubmit = document.querySelector('.main-form__submit');

    const formTitle = document.querySelector('.main-form__input--title');
    const formDescription = document.querySelector('.main-form__input--description');
    const formReward = document.querySelector('.main-form__input--reward');


    addTaskButton.addEventListener('click', async() => {
        addTaskForm.style.display = 'flex';
        addTaskForm.dataset.mode = 'create';
        formTitle.value = '';
        formDescription.value = '';
        formReward.value = '';
        addTaskSubmit.value = 'Añadir tarea';
    });

    addTaksClose.addEventListener('click', async() => {
        addTaskForm.style.display = 'none';
    });

    const taskModify = document.querySelectorAll('.main-list__item-modify');
    taskModify.forEach(item => {
        item.addEventListener('click', async () => {
            addTaskForm.style.display = 'flex';
    
            const taskId = item.parentElement.dataset.taskId;
            formTitle.value = item.parentElement.querySelector('.main-list__item-content__title').innerText;
            formDescription.value = item.parentElement.querySelector('.main-list__item-content__description').innerText;
            formReward.value = item.parentElement.querySelector('.main-list__item-reward').innerText.replace('€', '');
    
            addTaskForm.dataset.mode = 'modify';
            addTaskForm.dataset.taskId = taskId;
            addTaskSubmit.value = 'Modificar tarea';
        });
    });
    

    addTaskForm.addEventListener('submit', async (event) => {
        if (addTaskForm.dataset.mode === 'create') {
            event.preventDefault(); 

            const token = localStorage.getItem('token');
    
            const title = formTitle.value;
            const description = formDescription.value;
            const reward = parseFloat(formReward.value);
    
            if (!token) {
                window.location.href = '/';
                return;
            }
    
            const res = await fetch(`https://sculpin-pro-newly.ngrok-free.app/tasks/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify({
                    "id": Math.floor(Math.random() * 900000) + 100000,
                    "title": title,
                    "description": description,
                    "reward": reward
                })
            });
    
            if (res == 401) { 
                window.location.href = '/';
            } else if (!res.ok) {
                alert('No se ha podido crear la tarea');
            } else {
                window.location.reload();
            }
        } else if (addTaskForm.dataset.mode === 'modify') {
            event.preventDefault(); 

            const token = localStorage.getItem('token');
    
            const title = formTitle.value;
            const description = formDescription.value;
            const reward = parseFloat(formReward.value);
            const taskId = addTaskForm.dataset.taskId;
    
            if (!token) {
                window.location.href = '/';
                return;
            }
    
            const res = await fetch(`https://sculpin-pro-newly.ngrok-free.app/tasks/update/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify({
                    "new_title": title,
                    "new_description": description,
                    "new_reward": reward
                })
            });
    
            if (res == 401) { 
                window.location.href = '/';
            } else if (!res.ok) {
                alert(`No se ha podido modificar la tarea`);
            } else {
                window.location.reload();
            }
        }
    });
})();