(async () => {
    const token = localStorage.getItem('token');
  
    if (!token) {
        window.location.href = '../';
    }
  
    const playloadBase64 = token.split('.')[1];
    const playloadJson = atob(playloadBase64);
    const playload = JSON.parse(playloadJson);
    const userId = playload.sub;
  
    const resUser = await fetch(`https://sculpin-pro-newly.ngrok-free.app/users/get/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
        }
    });
  
    if (!resUser.ok) {
        window.location.href = '../';
    }
    
    const user = await resUser.json();
  
    if (user.role !== 'child') {
        window.location.href = '../';
    }

    document.querySelector('main').style.display = 'flex';
  
    document.title = `Página de ${user.username}`;
  
    const amountSpan = document.querySelector('.main-amount');
    amountSpan.textContent = `${user.amount.toFixed(2)} €`;

    const resTasks = await fetch(`https://sculpin-pro-newly.ngrok-free.app/tasks/assigned/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
        }
    });

    if (!resTasks.ok) {
        const listaCompletadas = document.querySelector('.main-list.--completed');
        listaCompletadas.innerHTML = `<li class="main-list__item"><p>¡No tienes tareas por completar!</p></li>`;

        const listaPendientes = document.querySelector('.main-list.--pending');
        listaPendientes.innerHTML = `<li class="main-list__item"><p>¡No tienes tareas pendientes!</p></li>`;

        const resAllTasks = await fetch('https://sculpin-pro-newly.ngrok-free.app/tasks/get', {
            headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true"
            }
        });
    }

    const dataTasks = await resTasks.json();
    const tareas = dataTasks.tasks;

    const listaPendientes = document.querySelector('.main-list.--pending')
    const listaCompletadas = document.querySelector('.main-list.--completed')

    tareas.forEach(tarea => {
        const li = document.createElement('li');

        li.dataset.taskId = tarea.id;
        li.dataset.userId = userId;

        li.className = 'main-list__item';
        li.innerHTML = `
            <span class="main-list__item-check-pending"></span>
            <div class="main-list__item-content">
                <h3 class="main-list__item-content__title">${tarea.title}</h3>
                <p class="main-list__item-content__description">${tarea.description}</p>
            </div>
            <span class="main-list__item-reward">${tarea.reward.toFixed(2)}€</span>
        `;

        if (tarea.status === 'PENDIENTE') {
            listaPendientes.appendChild(li);
        } else {
            li.querySelector('.main-list__item-check-pending').className = 'main-list__item-check-completed';
            listaCompletadas.appendChild(li);
        }
    })

    if (listaPendientes.children.length === 0) {
        listaPendientes.innerHTML = '<p class="main-list__empty">¡No hay tareas pendientes!</p>';
    }

    if (listaCompletadas.children.length === 0) {
        listaCompletadas.innerHTML = '<p class="main-list__empty">¡No has completado ninguna tarea!</p>';
    } 

    const items = document.querySelectorAll('.main-list__item');
    items.forEach(item => {
        const checkPending = item.querySelector('.main-list__item-check-pending');

        if (checkPending) {
            checkPending.addEventListener('click', async() => {
                try {
                    const token = localStorage.getItem('token');
    
                    if (!token) {
                        window.location.href = '/';
                    }
    
                    const taskId = item.dataset.taskId;
                    const userId = item.dataset.userId;
    
                    const res = await fetch (`https://sculpin-pro-newly.ngrok-free.app/tasks/complete`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                            "ngrok-skip-browser-warning": "true"
                        },
                        body: JSON.stringify({
                            task_id: taskId,
                            user_id: userId
                        })
                    })
    
                    const data = await res.json();
    
                    if (data.status === 1) {
                        window.location.reload()
                    } else {
                        alert('Ha ocurrido un error al completar la tarea')
                    }
    
                } catch (e) {
                    console.error('Error al marcar la tarea como completada', e)
                }
            });
        }
    });
})();
  

