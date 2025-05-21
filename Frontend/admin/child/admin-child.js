(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/';
    }

    console.log(token)

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
        window.location.href = "/";
    }

    // AÑADIENDO EL NOMBRE DEL USUARIO AL QUE ADMINISTRA

    const title = document.querySelector('.main-title');
    fetch(`https://sculpin-pro-newly.ngrok-free.app/users/get`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
        }
    }).then(res => res.json()).then(data => {
        const childId = localStorage.getItem('childId');
        const user = data[childId - 1].username;
        title.innerText = `ADMINISTRANDO A: ${user}`;
        title.style.textTransform = 'uppercase';

        const child = data[childId - 1];
        const amount = child.amount;
        const amountElement = document.querySelector('.main-amount');

        if (amount === 0) {
            amountElement.innerHTML = `<p>0.00 €</p>  
            <span class="main-amount-text">
                reset
            </span>`;
        } else {
            amountElement.innerHTML = `<p>${amount.toFixed(2)} €</p>       
            <span class="main-amount-text">
                reset
            </span>`;
        }

        async function getTasks() {
            try {
                const resTasks = await fetch(`https://sculpin-pro-newly.ngrok-free.app/tasks/assigned/${childId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "ngrok-skip-browser-warning": "true"
                    }
                });

                if (!resTasks.ok) {
                    throw new Error('Error al obtener las tareas asignadas');
                }

                const dataTasks = await resTasks.json();
                const assignedTasks = dataTasks.tasks;

                if (assignedTasks) {
                    const assignedTaskIds = new Set(assignedTasks.map(t => t.id));

                    // Renderizar tareas completadas
                    const listaCompletadas = document.querySelector('.main-completed');
                    listaCompletadas.innerHTML = '';
                    const completadas = assignedTasks.filter(t => t.status === 'COMPLETADA');
                    if (completadas.length === 0) {
                        const li = document.createElement('li');
                        li.className = 'main-completed__item';
                        li.innerHTML = `<p>No hay tareas completadas.</p>`;
                        listaCompletadas.appendChild(li);
                    } else {
                        completadas.forEach(t => {
                            const li = document.createElement('li');
                            li.dataset.taskId = t.id;
                            li.className = 'main-completed__item';
                            li.innerHTML = `
                                <div class="main-completed__item-content">
                                    <h3 class="main-completed__item-content__title">${t.title}</h3>
                                    <p class="main-completed__item-content__description">${t.description}</p>
                                </div>
                                <span class="main-completed__item-reward">${t.reward.toFixed(2)}€</span>
                                <button class="main-completed__item-button">Confirm</button>
                            `;
                            listaCompletadas.appendChild(li);
                        });
                    }

                    // Renderizar tareas pendientes
                    const listaPendientes = document.querySelector('.main-pending');
                    listaPendientes.innerHTML = '';
                    const pendientes = assignedTasks.filter(t => t.status === 'PENDIENTE');
                    if (pendientes.length === 0) {
                        const li = document.createElement('li');
                        li.className = 'main-pending__item';
                        li.innerHTML = `<p>No hay tareas pendientes.</p>`;
                        listaPendientes.appendChild(li);
                    } else {
                        pendientes.forEach(t => {
                            const li = document.createElement('li');
                            li.dataset.taskId = t.id;
                            li.className = 'main-pending__item';
                            li.innerHTML = `
                                <div class="main-pending__item-content">
                                    <h3 class="main-pending__item-content__title">${t.title}</h3>
                                    <p class="main-pending__item-content__description">${t.description}</p>
                                </div>
                                <span class="main-pending__item-reward">${t.reward.toFixed(2)}€</span>
                                <button class="main-pending__item-button">Unassign</button>
                            `;
                            listaPendientes.appendChild(li);
                        });
                    }

                    // Obtener todas las tareas disponibles
                    const resAllTasks = await fetch('https://sculpin-pro-newly.ngrok-free.app/tasks/get', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "ngrok-skip-browser-warning": "true"
                        }
                    });
                    const dataAllTasks = await resAllTasks.json();
                    const unassigned = dataAllTasks.tasks.filter(t => !assignedTaskIds.has(t.id));

                    const listaUnassigned = document.querySelector('.main-unassigned');
                    listaUnassigned.innerHTML = '';
                    unassigned.forEach(t => {
                        const li = document.createElement('li');
                        li.dataset.taskId = t.id;
                        li.className = 'main-unassigned__item';
                        li.innerHTML = `
                            <div class="main-unassigned__item-content">
                                <h3 class="main-unassigned__item-content__title">${t.title}</h3>
                                <p class="main-unassigned__item-content__description">${t.description}</p>
                            </div>
                            <span class="main-unassigned__item-reward">${t.reward.toFixed(2)}€</span>
                            <button class="main-unassigned__item-button">Assign</button>
                        `;
                        listaUnassigned.appendChild(li);
                    });

                    // EVENTOS DE BOTONES
                    document.querySelectorAll('.main-completed__item-button').forEach(button => {
                        console.log(button)
                        button.addEventListener('click', async (e) => {
                            const taskId = e.target.closest('li').dataset.taskId;
                            const res = await fetch(`https://sculpin-pro-newly.ngrok-free.app/tasks/complete-confirm`, {
                                method: 'PUT',
                                headers: { 
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json'  ,
                                    "ngrok-skip-browser-warning": "true"
                                },
                                body: JSON.stringify({ 
                                    task_id: taskId,
                                    user_id: childId
                                })
                            });
                    
                            if (res.ok) {
                                getTasks();  // Refresca las tareas
                            } else {
                                alert('Error al confirmar la tarea.');
                            }
                        });
                    });
                    

                    document.querySelectorAll('.main-pending__item-button').forEach(button => {
                        button.addEventListener('click', async (e) => {
                            const taskId = e.target.closest('li').dataset.taskId;
                            const userId = localStorage.getItem('childId');
                    
                            const res = await fetch(`https://sculpin-pro-newly.ngrok-free.app/tasks/unassign`, {
                                method: 'POST',
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json'  ,
                                    "ngrok-skip-browser-warning": "true"
                                },
                                body: JSON.stringify({
                                    task_id: taskId,
                                    user_id: userId
                                })
                            });
                    
                            if (res.ok) {
                                getTasks();  
                            } else {
                                alert('Error al desasignar la tarea.');
                            }
                        });
                    });
                    

                    document.querySelectorAll('.main-unassigned__item-button').forEach(button => {
                        button.addEventListener('click', async (e) => {
                            const taskId = e.target.closest('li').dataset.taskId;
                            const childId = localStorage.getItem('childId'); // Asegúrate de que 'childId' esté en localStorage
                    
                            const res = await fetch(`https://sculpin-pro-newly.ngrok-free.app/tasks/assign`, {
                                method: 'POST',
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                    "ngrok-skip-browser-warning": "true"
                                },
                                body: JSON.stringify({
                                    task_id: taskId, // Asegúrate de usar `task_id` en vez de `taskId` en el backend
                                    user_id: childId  // Asegúrate de que se esté enviando correctamente el `childId`
                                })
                            });
                    
                            if (res.ok) {
                                getTasks();  // Refresca la lista de tareas
                            } else {
                                alert('Error al asignar la tarea.');
                            }
                        });
                    });
                    
                }

            } catch (e) {
                // Manejo de errores en el catch
                const listaCompletadas = document.querySelector('.main-completed');
                listaCompletadas.innerHTML = `<li class="main-completed__item"><p>No se pudieron cargar las tareas completadas.</p></li>`;

                const listaPendientes = document.querySelector('.main-pending');
                listaPendientes.innerHTML = `<li class="main-pending__item"><p>No se pudieron cargar las tareas pendientes.</p></li>`;

                const resAllTasks = await fetch('https://sculpin-pro-newly.ngrok-free.app/tasks/get', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "ngrok-skip-browser-warning": "true"
                    }
                });

                const listaUnassigned = document.querySelector('.main-unassigned');
                listaUnassigned.innerHTML = '';

                const dataAllTasks = await resAllTasks.json();

                dataAllTasks.tasks.forEach(t => {
                    const li = document.createElement('li');
                    li.dataset.taskId = t.id;
                    li.className = 'main-unassigned__item';
                    li.innerHTML = `
                        <div class="main-unassigned__item-content">
                            <h3 class="main-unassigned__item-content__title">${t.title}</h3>
                            <p class="main-unassigned__item-content__description">${t.description}</p>
                        </div>
                        <span class="main-unassigned__item-reward">${t.reward.toFixed(2)}€</span>
                        <button class="main-unassigned__item-button">Assign</button>
                    `;
                    listaUnassigned.appendChild(li);
                });

                // EVENTOS DE BOTONES
                document.querySelectorAll('.main-completed__item-button').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const taskId = e.target.closest('li').dataset.taskId;
                        const res = await fetch(`https://sculpin-pro-newly.ngrok-free.app/tasks/complete-confirm`, {
                            method: 'PUT',
                            headers: { 
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json',
                                "ngrok-skip-browser-warning": "true"
                            },
                            body: JSON.stringify({ 
                                task_id: taskId,
                                user_id: childId
                            })
                        });
                
                        if (res.ok) {
                            getTasks();  // Refresca las tareas
                        } else {
                            alert('Error al confirmar la tarea.');
                        }
                    });
                });
                

                document.querySelectorAll('.main-pending__item-button').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const taskId = e.target.closest('li').dataset.taskId;
                        const userId = localStorage.getItem('childId');
                
                        const res = await fetch(`https://sculpin-pro-newly.ngrok-free.app/tasks/unassign`, {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json',
                                "ngrok-skip-browser-warning": "true"
                            },
                            body: JSON.stringify({
                                task_id: taskId,
                                user_id: userId
                            })
                        });
                
                        if (res.ok) {
                            getTasks();  
                        } else {
                            alert('Error al desasignar la tarea.');
                        }
                    });
                });
                

                document.querySelectorAll('.main-unassigned__item-button').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const taskId = e.target.closest('li').dataset.taskId;
                        const childId = localStorage.getItem('childId'); // Asegúrate de que 'childId' esté en localStorage
                
                        const res = await fetch(`https://sculpin-pro-newly.ngrok-free.app/tasks/assign`, {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json',
                                "ngrok-skip-browser-warning": "true"
                            },
                            body: JSON.stringify({
                                task_id: taskId, // Asegúrate de usar `task_id` en vez de `taskId` en el backend
                                user_id: childId  // Asegúrate de que se esté enviando correctamente el `childId`
                            })
                        });
                
                        if (res.ok) {
                            getTasks();  // Refresca la lista de tareas
                        } else {
                            alert('Error al asignar la tarea.');
                        }
                    });
                });

            }

        }

        document.querySelector('.main-amount-text').addEventListener('click', async () => {
            const res = await fetch(`https://sculpin-pro-newly.ngrok-free.app/users/reset/${childId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify({
                    user_id: childId
                })
            });

            if (res.ok) {
                window.location.reload();
            } else {
                alert('Error al resetear la cantidad.');
            }
        });

        getTasks();
    });
})();
