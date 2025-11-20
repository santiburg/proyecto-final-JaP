(() => {
    'use strict'


    fetch('http://localhost:3000/protected', {
        method: 'GET',  // Ensure the method is GET
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => {
        if (response.ok) {
          window.location.href = 'my-profile.html';
        }
        })

    const forms = document.querySelectorAll('.needs-validation');

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', async event => {
            event.preventDefault();

            const email = form.querySelector('#email');
            const password = form.querySelector('#password');
            const emailValidation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (password.value.length < 6) {
                password.setCustomValidity('Debe ingresar una contraseña mayor a 6 caracteres.');
            } else {
                password.setCustomValidity('');
            }

            if (!emailValidation.test(email.value)) {
                email.setCustomValidity('Por favor ingrese un formato de correo válido.');
            } else {
                email.setCustomValidity('');
            }

            if (!form.checkValidity()) {
                event.stopPropagation();
                form.classList.add('was-validated');
                return;
            }

            try {
                const registerResponse = await fetch('http://localhost:3000/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.value, password: password.value }),
                });
                if (!registerResponse.ok) {
                    if (registerResponse.status === 400) {
                        alert('Solicitud inválida. Por favor, revise los datos proporcionados.');
                    } else if (registerResponse.status === 409) {
                        alert('El correo electrónico ya está registrado. Por favor, intente iniciar sesión.');
                    } else if (registerResponse.status === 500) {
                        alert('Error del servidor. Por favor, intente más tarde.');
                    } else {
                        alert('Error desconocido al registrarse. Código de error: ' + registerResponse.status);
                    }
                    return;
                }
                else {
                    alert('Registrado con exito');
                }


                // Intento loggear con los datos del registro.

                const loginResponse = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.value, password: password.value }),
                });

                if (!loginResponse.ok) {
                        alert('Error desconocido al iniciar sesión. Código de error: ' + loginResponse.status);
                }

                const loginData = await loginResponse.json();
                localStorage.setItem('email', email.value);
                localStorage.setItem('token', loginData.token);
                window.location.href = 'index.html';
            } catch (error) {
                console.error(error);
                alert('Error: ' + error.message);
            }
        }, false);
    });
})();
