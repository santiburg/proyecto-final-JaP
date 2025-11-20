const input = document.getElementById("uploadImage"); // botón donde se sube la imagen
const profilePicture = document.getElementById("profilePicture"); // elemento donde se muestra la imagen
const savedProfilePicture = localStorage.getItem("profilePicture"); // obtener la imagen guardada en el localStorage

document.addEventListener("DOMContentLoaded", function () {
    const storeEmail = localStorage.getItem("email");
    if (storeEmail) {
        document.getElementById("E-mail").value = storeEmail;
        document.getElementById("nickname").textContent = "@" + storeEmail.split('@')[0];
    }
    if (savedProfilePicture) {
        profilePicture.src = savedProfilePicture;
    }
    
    // Datos cargados anteriormente
    const storedData = JSON.parse(localStorage.getItem('profileData'));
    if (storedData){
        document.getElementById('name').value = storedData.name || "";
        document.getElementById('second-name').value = storedData.secondName || '';
        document.getElementById('lastname').value = storedData.lastname || '';
        document.getElementById('second-lastname').value = storedData.secondLastname || '';
        document.getElementById('tel').value = storedData.tel || '';
    }
});

document.getElementById("profilePicture").addEventListener("click", () => {
    document.getElementById("uploadImage").click();
});

// Evento para cuando se sube una imagen
input.addEventListener("change", () => {
    // change es un evento que se dispara cuando cambia el valor de un input
    const fr = new FileReader(); // objeto FileReader para leer la imagen
    fr.readAsDataURL(input.files[0]); // leer el archivo seleccionado como data URL (base64)

    fr.addEventListener("load", () => {
        // evento que se dispara cuando se termina de cargar la imagen
        const url = fr.result; // obtener la data URL de la imagen

        localStorage.setItem("profilePicture", url); // guardar la imagen en el localStorage
        profilePicture.src = url;
    });
});


// Validación de datos
(() => {
    // verificación estricta de variables
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation');
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            event.preventDefault(); 
            event.stopPropagation();

            // datos del form
            const name = form.querySelector('#name');
            const secondName = form.querySelector('#second-name');
            const lastname = form.querySelector('#lastname');
            const secondLastname = form.querySelector('#second-lastname');
            const tel = form.querySelector('#tel');
            // const email = form.querySelector('#email'); 

            // const emailValidation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            // variable de control
            let valid = true;

            // nombre (obligatorio)
            if (!name.value) {
                name.setCustomValidity('Debe ingresar un nombre.');
                valid = false;
            } else {
                name.setCustomValidity('');
            }

            // apellido (obligatorio)
            if (!lastname.value) {
                lastname.setCustomValidity('Debe ingresar un apellido.');
                valid = false;
            } else {
                lastname.setCustomValidity('');
            }

            if (tel.value.match(/^[0-9]+$/) || tel.value == "") {
                tel.setCustomValidity('');
            } else{
                tel.setCustomValidity('Solo se permiten valores numericos.');
                valid = false;
            }


            // email (obligatorio) PREGUNTAR SI SE MODIFICA
            // if (!emailValidation.test(email.value)) {
            //     email.setCustomValidity('Por favor ingrese un formato de correo válido.');
            //     valid = false;
            // } else {
            //     email.setCustomValidity('');
            // }

            // si el formulario es valido, guardar en localStorage
            if (valid) {
                const profileData = {
                    name: name.value.trim(),
                    secondName: secondName.value.trim(),
                    lastname: lastname.value.trim(),
                    secondLastname: secondLastname.value.trim(),
                    // email: email.value,
                    tel: tel.value.trim()
                };

                localStorage.setItem('profileData', JSON.stringify(profileData));
                alert('Datos guardados con exito');
            } 

            form.classList.add('was-validated')
        }, false)
    })
})()

