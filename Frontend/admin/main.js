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
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            window.location.href = '/';
        }

        const user = await res.json();
        const role = user.role;
        console.log(role);

        if (role !== 'parent') {
            window.location.href = '/';
        }

        document.querySelector('main').style.display = 'flex';
        
    } catch (e) {
        window.location.href="/";
    }

    const izan = document.querySelector('.main-container__izan');
    const joel = document.querySelector('.main-container__joel');
    const elia = document.querySelector('.main-container__elia');

    fetch('https://sculpin-pro-newly.ngrok-free.app/users/get', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(res => res.json()).then(users => {

        console.log(users);

        izan.addEventListener('click', async() => {
            const izanId = users.find(user => user.username === 'Izan').id;
            localStorage.setItem('childId', izanId);
            window.location.href = '../admin/child/';
        });

        joel.addEventListener('click', async() => {
            const joelId = users.find(user => user.username === 'Joel').id;
            localStorage.setItem('childId', joelId);
            window.location.href = '../admin/child/';
        });

        elia.addEventListener('click', async() => {
            const eliaId = users.find(user => user.username === 'Èlia').id;
            localStorage.setItem('childId', eliaId);
            window.location.href = '../admin/child/';
        });
    });
})();