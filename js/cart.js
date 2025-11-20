// Función para obtener el carrito desde la base de datos
async function fetchCartFromDatabase() {
    try {
        // Realiza la solicitud a la API de tu backend
        const response = await fetch('/api/cart', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener el carrito desde la base de datos');
        }

        // Convierte la respuesta en JSON
        const cartData = await response.json();

        // Devuelve el carrito
        return cartData;
    } catch (error) {
        console.error('Error:', error);
        return []; // Devuelve un carrito vacío en caso de error
    }
}

// Inicializa el carrito
async function initializeCart() {
    // Obtiene el carrito desde localStorage
    let cart = JSON.parse(localStorage.getItem('cart'));

    // Usa el carrito en tu aplicación
    return cart;
}

// Ejecuta la inicialización del carrito
initializeCart();


let cart = JSON.parse(localStorage.getItem('cart')) || []; //Obtengo el carrito desde la base de datos

function renderCart() { //Muestro los productos del localStorage en el carrito
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = '';

    cart.forEach(cartItem => {
        const item = cartItem.item; // Accede al item del carrito

        const itemElement = document.createElement('div');
        itemElement.className = 'card mb-4 ';
        itemElement.id = `item-cart`;
        itemElement.className += `item-${item.id}`;
        itemElement.innerHTML = `
        <div class="row align-items-center g-3 m-3">
            <!-- IMA -->
            <div class="col-12 col-md-2 mt-0">
                <img src="${item.image}" class="product-image img-fluid rounded" alt="${item.name}">
            </div>
            
            <!-- NOMBRE PRECIO CANTIDAD -->

            <div class="col-12 col-md-10">
                <div class="card-body p-0 ">
                    <div class="row g-3">
                        <!-- Product Info - Full width on mobile, 6 columns on md+ -->
                        <div class="col-12 col-md-6 mt-0">
                            <h5 class="card-title mb-3 mt-md-0 mt-2">${item.name}</h5>
                            <p class="card-text text-muted mb-3">Precio: ${item.currency} ${item.cost}</p>
                            <div class="row g-3">
                                <div  class="input-group" style="max-width: 200px;">
                                    <span class="input-group-text">Cantidad</span>
                                    <input type="number" 
                                    onkeydown="return false;"
                                    class="form-control quantity-input" 
                                    value="${cartItem.quantity}" 
                                    min="1" 
                                    data-item-id="${item.id}"/>
                                </div>
                            </div>
                        </div>
                        
                        <!-- SUBTOTAL PRECIO -->
                        <div class="col-12 col-md-6 text-start text-md-end">
                            <p class="card-text mb-2">Subtotal:</p>
                            <p class="card-text subtotal mb-2 fw-bold"></p>
                            <i class="bi bi-trash text-danger" onclick="deleteItem(${item.id})"></i>     
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
        cartContainer.appendChild(itemElement);
    });

    updateTotal(); // Llamo a la función para obtener los subtotales y el total por primera vez
}

function updateTotal() {
    const quantities = document.querySelectorAll('.quantity-input');
    let total = 0;
    quantities.forEach(input => {
        const itemId = parseInt(input.getAttribute('data-item-id'));
        const cartItem = cart.find(cartItem => cartItem.item.id === itemId); // accede al item id
        const existingItemIndex = cart.findIndex(cartItem => cartItem.item.id === itemId);
        const quantity = parseInt(input.value) || 0;
        cart[existingItemIndex].quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        const subtotal = cartItem.item.currency === 'USD' ? cartItem.item.cost * quantity : cartItem.item.cost / 42 * quantity; // usa costo de item * cantidad para el subtotal individual
        total += subtotal;
        const subtotalElement = input.closest('.card-body').querySelector('.subtotal');
        subtotalElement.textContent = `${cartItem.item.currency} ${cartItem.item.cost * quantity.toFixed(2)}`; // actualiza el subtotal individual
    });
    document.getElementById('subtotal').textContent = `${total.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `${total.toFixed(2)}`;
    actualizarCostos();
}

function deleteItem(itemId) {
    const existingItemIndex = cart.findIndex(cartItem => cartItem.item.id === itemId);
    cart.splice(existingItemIndex, 1);

    fetch('http://localhost:3000/delete_cart', {
        method: 'POST',
        headers: {
            'Authorization': `${TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email: localStorage.getItem('email'), product_id: itemId}) // Send the individual product update
    })

    localStorage.setItem('cart', JSON.stringify(cart));

    document.getElementById(`item-cart`).remove();
    renderCart();
    document.getElementById("cartBadge").textContent = JSON.parse(localStorage.getItem('cart')).length || 0
    if (cart.length == 0) {
        document.getElementById("btnCompra").setAttribute("disabled", '');
    }
}

function actualizarCostos() {
    const subtotal = document.getElementById('subtotal');
    const shippingMethod = document.getElementById('shippingMethod');
    const subtotalCart = document.getElementById('cart-total')

    if (document.getElementById("cart-total").innerText == '0.00') {
        document.getElementById("btnCompra").setAttribute("disabled", '');
    }
    else {
        document.getElementById("btnCompra").removeAttribute("disabled");
    }
    if (shippingMethod.value == '') {
        return
    }

    subtotal.innerText = subtotalCart.innerText;
    costoEnvio.innerText = (parseFloat(shippingMethod.value) * parseFloat(subtotal.innerText)).toFixed(2);
    total.innerText = (parseFloat(costoEnvio.innerText) + parseFloat(subtotal.innerText)).toFixed(2);

}

document.addEventListener('DOMContentLoaded', function () {

    renderCart();
    document.getElementById('cart-items').addEventListener('input', updateTotal);

    if (cart.length == 0) {
        document.getElementById("btnCompra").setAttribute("disabled", '');
    }

    const form = document.getElementById('carritoForm');
    const shippingMethod = document.getElementById('shippingMethod');
    const formaPago = document.getElementById('formaPago');

    // Actualizar costos cuando cambia el tipo de envío
    shippingMethod.addEventListener('change', actualizarCostos);

    // Mostrar/ocultar campos según forma de pago
    formaPago.addEventListener('change', function () {
        if (this.value === 'tarjeta') {
            document.getElementById('metodoDePago').innerHTML = `
            <div id="camposTarjeta">
                        <div class="mb-3">
                            <input type="text" class="form-control" id="numeroTarjeta" placeholder="Número de tarjeta" maxlength="19" oninput="formatCreditCard(this)" required>
                            <div class="invalid-feedback">
                                Por favor ingrese el número de tarjeta.
                            </div>
                        </div>
                        <div class="mb-3">
                            <input type="text" class="form-control" id="nombreTarjeta" placeholder="Nombre en la tarjeta" oninput="formatCVName(this)" required>
                            <div class="invalid-feedback">
                                Por favor ingrese el nombre en la tarjeta.
                            </div>
                        </div>
                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <input type="text" class="form-control" id="fechaVencimiento" placeholder="Fecha de vencimiento (MM/AA)" maxlength="5" oninput="formatExpirationDate(this)" required>
                                <div class="invalid-feedback">
                                    Por favor ingrese la fecha de vencimiento.
                                </div>
                            </div>
                            <div class="col-md-6">
                                <input type="text" class="form-control" id="cvv" placeholder="CVV" maxlength="3" oninput="formatCVV(this)" required>
                                <div class="invalid-feedback">
                                    Por favor ingrese el CVV.
                                </div>
                            </div>
                        </div>
                    </div>`
        } else if (this.value === 'transferencia') {
            document.getElementById('metodoDePago').innerHTML = `
                                <div id="camposTransferencia">
                        <div class="mb-3">
                            <input type="text" class="form-control" id="numeroCuenta" placeholder="Número de cuenta" oninput="formatAccountNumber(this)" required>
                            <div class="invalid-feedback">
                                Por favor ingrese el número de cuenta.
                            </div>
                        </div>
                        <div class="mb-3">
                            <input type="text" class="form-control" id="titularCuenta" placeholder="Titular de la cuenta" required>
                            <div class="invalid-feedback">
                                Por favor ingrese el titular de la cuenta.
                            </div>
                        </div>
                    </div>`
        }
    });

    // Validación del formulario en submit.
    form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {

            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();

            const formModalElement = document.getElementById('carritoModal');
            const formModal = bootstrap.Modal.getInstance(formModalElement)

            formModal.hide();

            // Muestra el modal de exito

            const successModalElement = document.getElementById('successModal');
            const successModal = bootstrap.Modal.getInstance(successModalElement) || new bootstrap.Modal(successModalElement);

            successModal.show();
            document.getElementById('checkmark').play();
            // Tras 2 segundos, cierra el modal de exito

            setTimeout(() => {
                successModal.hide();
            }, 5000);

        }

        form.classList.add('was-validated');
    });



});


document.getElementById('departamento').addEventListener('change', function () {
    const API_CIUDAD = `https://direcciones.ide.uy/api/v0/geocode/localidades?alias=true&departamento=${this.value}`

    fetch(API_CIUDAD).then(response => response.json()).then(cities => {
        const citySelect = document.getElementById('city');
        citySelect.innerHTML = '';
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.id;
            option.textContent = city.nombre.toLowerCase();
            option.textContent = option.textContent.charAt(0).toUpperCase() + option.textContent.slice(1);
            citySelect.appendChild(option);
        });

    })
    if (citySelect.options.length === 0) {
        citySelect.disabled = true;
    } else {
        citySelect.disabled = false;
    }
})

// Función para validación de inputs en el formulario
function showValidation(input, isValid, message) {

    if (isValid) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        input.setCustomValidity("");
    } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        input.setCustomValidity(message);
        input.reportValidity();
    }

}

// Credit Card Format and Validation (16 digits)
function formatCreditCard(input) {

    let inputValue = input.value.replace(/\D/g, ''); // Solo números

    inputValue = inputValue.replace(/(\d{4})(?=\d)/g, '$1 '); // Añade espacio cada 4 nums
    input.value = inputValue.slice(0, 19); // Limita los caractéres

    // Validación
    let isValid = inputValue.replace(/\s/g, '').length === 16;
    showValidation(input, isValid, "La tarjeta de crédito debe tener 16 dígitos.");
}

function formatExpirationDate(input) {

    let inputValue = input.value.replace(/\D/g, ''); // Solo números

    // Añade '/' entre mes y año
    if (inputValue.length > 2) {
        inputValue = inputValue.slice(0, 2) + '/' + inputValue.slice(2, 4);
    }

    input.value = inputValue.slice(0, 5); // Limita a 5 caracteres

    // Validación
    let isValid = /^(\d{2}\/\d{2})$/.test(input.value);
    showValidation(input, isValid, "La fecha debe seguir el formato MES/AÑO.");
}

function formatCVV(input) {

    input.value = input.value.replace(/\D/g, '');

    // limita el largo a 3
    input.value = input.value.slice(0, 3);

    let isValid = input.value.length === 3;
    showValidation(input, isValid, "CVV Debe tener 3 números.");
}

// Formato de otros inputs, sin validación.
function formatNumber(input) {
    input.value = input.value.replace(/\D/g, '');
    input.value = input.value.slice(0, 5);
}

function formatCVName(input) {
    input.value = input.value.replace(/[^a-zA-Z\s]/g, '');
}

function formatStreet(input) {
    input.value = input.value.replace(/[^a-zA-Z\s]/g, '');
}

function formatCorner(input) {
    input.value = input.value.replace(/[^a-zA-Z\s]/g, '');
}

function formatAccountNumber(input) {
    input.value = input.value.replace(/\D/g, '');
}

function formatAccountOwner(input) {
    input.value = input.value.replace(/[^a-zA-Z\s]/g, '');
}
