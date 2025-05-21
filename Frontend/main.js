document.addEventListener('DOMContentLoaded', () => {

    const form = document.querySelector('.main-container__form')

    console.log(form)

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = e.target[0].value;
        const password = e.target[1].value;

        // Realizar la solicitud de inicio de sesión
        const res = await fetch('https://sculpin-pro-newly.ngrok-free.app/users/login', {
            method: 'POST',
            headers: {
                "ngrok-skip-browser-warning": "true",
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            alert("Usuario o contraseña incorrectos");
            return;
        }

        // Obtener los datos de la respuesta
        const data = await res.json();
        const token = data.access_token;
        const role = data.role;

        // Guardar el token en localStorage
        localStorage.setItem('token', token);
        
        // Redirigir según el rol
        if (role === 'parent') {
            window.location.href = '/admin';
        } else {
            window.location.href = '/child';
        }
    });

});