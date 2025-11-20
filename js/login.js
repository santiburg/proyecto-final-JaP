(() => {
  'use strict'

  //Redirijo a la pantalla de perfil si ya se tiene token


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
        //POST para iniciar sesión
        const loginResponse = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.value, password: password.value }),
        });

        if (!loginResponse.ok) {
          if (loginResponse.status === 401) {
            alert('Credenciales incorrectas. Por favor, verifique su correo y contraseña.');
          } else if (loginResponse.status === 404) {
            alert('Usuario no encontrado. Por favor, regístrese primero.');
            window.location.href = 'register.html';
          } else if (loginResponse.status === 500) {
            alert('Error del servidor. Por favor, intente más tarde.');
          } else {
            alert('Error desconocido al iniciar sesión. Código de error: ' + loginResponse.status);
          }
          return
        }

        const loginData = await loginResponse.json();

        localStorage.setItem('email', email.value);
        localStorage.setItem('token', loginData.token);

        // POST para obtener carrito guardado, si se inicia sesión correctamente, y existe.
        const cartResponse = await fetch('http://localhost:3000/get_cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${loginData.token}`, // Verifica el token.
          },
          body: JSON.stringify({ email: email.value, password: password.value }), // Envia los datos del usuario para verificar que sea él, quien accede a los productos del carrito.
        });

        if (!cartResponse.ok) {
          alert('Error al obtener el carrito. Por favor, intente más tarde.');
        } else {
          const cartData = await cartResponse.json();
          // Guarda el carrito en el localStorage
          localStorage.setItem('cart', JSON.stringify(cartData));
          window.location.href = 'index.html';
          
        }
      } catch (error) {
        console.error(error);
        alert('Error: ' + error.message);
      }

    }, false);
  });
})();
