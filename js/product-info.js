// Utilizamos el localStorage para obtener el ID del producto seleccionado
const API_URL = `https://japceibal.github.io/emercado-api/products/${localStorage.getItem("itemID")}.json`;

const API_URL_REVIEWS = `https://japceibal.github.io/emercado-api/products_comments/${localStorage.getItem("itemID")}.json`

// Declaro la función que obtiene los datos del producto realizando un fetch a la API
const fetchItem = async () => {
    try {
        const respuesta = await fetch(API_URL);
        return await respuesta.json();
    } catch (error) {
        console.log(error);
    }
};

// Declaro la función que obtiene las reviews del producto realizando un fetch a la API
const fetchReviews = async () => {
    try {
        const respuesta = await fetch(API_URL_REVIEWS);
        return await respuesta.json();
    } catch (error) {
        console.log(error);
    }
};

fetchReviews().then((data) => {
    displayReviews(data);
});

fetchItem().then((data) => {
    showItem(data);
});

// Declaro la función showItem que muestra los datos del producto en la página, utilizando el JSON obtenido de la API
const showItem = (item) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItemIndex = cart.findIndex(cartItem => cartItem.item.id === item.id);

    let htmlContentToAppend = "";
    htmlContentToAppend += `
    <div class="row mx-3 mx-md-0">
         <a href="categories.html" class="mb-2 text-start text-muted text-decoration-none">${item.category}</a>
        
        <!-- Imágenes chiquitas -->
        <div class="col-12 col-lg-1 d-lg-block d-flex">
            ${item.images.map((image, index) => `
                <img src="${image}" alt="Item ${item.id} Image ${index + 1}" class="img-thumbnail mb-2 img2" data-large-image="${item.images[0]}" small-image="${image}">
            `).join('')}
        </div>

        <!-- Imagen grande -->
        <div class="col-10 col-lg-6 d-flex justify-content-center">
            <img id="largeImage" src="${item.images[0]}" alt="Item ${item.id}" class="img-thumbnail">
        </div>

        <!-- Descripción -->
        <div class="col-12 d-flex flex-column justify-content-start col-lg-5 mt-lg-0 mt-4">
            <h4 class="mb-0">${item.name}</h4> 
            <small class="mt-2 text-muted text-start">${item.soldCount} artículos vendidos</small>
            <p class="mt-2 mt-lg-4">${item.description}</p>
            <div class="d-block d-sm-flex mt-lg-auto mb-3">
                <h4 class="mb-3 mb-md-0">${item.currency} ${item.cost}</h4> 
                <div class="d-flex ms-sm-auto">
                    <div class="input-group me-2">
                        <span class="input-group-text">Cantidad</span>
                        <input type="number" class="form-control rounded-pill-md quantity-input" value="${cart[existingItemIndex]?.quantity || 1}" min="1" id="cantidad">
                    </div>
                    <button class="btn btn-comprar" id="comprar">Comprar</button>
                </div>
                
            </div>
        </div>
        
    </div>
    `;

    document.getElementById("item").innerHTML = htmlContentToAppend;

    let htmlContentToAppend2 = "";
    htmlContentToAppend2 += `
        <!-- Productos Relacionados -->
        <div class="ContenedorProductosR">
            <div class="productosR" class="card-text">
                ${item.relatedProducts.map((itemP, index) => `
                    <div class="productoRItem" onclick="setItemID(${itemP.id})"">
                        <img class="productosRImagen" src="${itemP.image}">
                        <p class="productosRNombre">${itemP.name}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.getElementById("productosR").innerHTML += htmlContentToAppend2;


    // Cambia la imágen al hacer click
    document.querySelectorAll('.img2').forEach(img => {
        img.addEventListener('mouseover', (e) => {
            const largeImage = document.getElementById('largeImage');
            largeImage.src = e.target.getAttribute('small-image');
        });
    });

    const comprarButton = document.getElementById('comprar');

    comprarButton.addEventListener('click', () => {
        const quantityToAdd = Number(document.getElementById('cantidad').value);

        if (existingItemIndex !== -1) {
            // Si el item existe, actualiza la cantidad.
            cart[existingItemIndex].quantity = quantityToAdd;
        } else {
            // Si no existe, lo agrega, y la cantidad.


            let filteredItem = {
                id: item.id,
                name: item.name,
                currency: item.currency,
                description: item.description,
                cost: item.cost,
                image: item.images[0]
            }
            cart.push({ item: filteredItem, quantity: quantityToAdd });


            document.getElementById("cartBadge").textContent = parseInt(document.getElementById("cartBadge").textContent) + 1;
        }
        alert(`Se encuentran ${quantityToAdd} ${item.name} agregados al carrito`);
        window.location.href = 'cart.html';
        // Convierte el array en un string JSON y lo almacena en el localStorage.
        localStorage.setItem('cart', JSON.stringify(cart));
    });

};

function setItemID(id) {
    localStorage.setItem("itemID", id);
    window.location = "product-info.html";
}

const reviewForm = document.getElementById('reviewForm');
const reviewsContainer = document.getElementById('reviewsContainer');

// Función para mostrar las reviews en la página
function displayReviews(reviews) {
    reviewsContainer.innerHTML = '';
    reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'col';
        reviewElement.innerHTML = `
                    <div class="card h-100 review">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h5 class="card-title">${review.user}</h5>
                                <small class="text-muted">${(review.dateTime).split(' ')[0]}</small>
                            </div>
                            <p class="card-text star-rating">
                            ${'<i class="bi bi-star-fill"></i>'.repeat(review.score)}
                            ${'<i class="bi bi-star"></i>'.repeat(5 - review.score)}
                            </p>
                            <p class="card-text">${review.description}</p>
                        </div>
                    </div>
                `;
        reviewsContainer.appendChild(reviewElement);
    });
}

// Evento para guardar la nueva review y mostrarla en la página
reviewForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const score = document.querySelector('input[name="rating"]:checked').value;
    const description = document.getElementById('comment').value;
    if (!localStorage.getItem('email')) {
        alert('Debe iniciar sesión para dejar un review');
        reviewForm.reset();
        return;
    }
    const user = localStorage.getItem('email').split('@')[0];
    const date = new Date().toISOString().split('T')[0];

    const reviewElement = document.createElement('div');
    reviewElement.className = 'col';
    reviewElement.innerHTML = `
                <div class="card h-100 review">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="card-title">${user}</h5>
                            <small class="text-muted">${date}</small>
                        </div>
                        <p class="card-text star-rating">
                            ${'<i class="bi bi-star-fill"></i>'.repeat(score)}
                            ${'<i class="bi bi-star"></i>'.repeat(5 - parseInt(score))}
                        </p>
                        <p class="card-text">${description}</p>
                    </div>
                </div>
            `;
    reviewsContainer.insertBefore(reviewElement, reviewsContainer.firstChild); // Inserta la nueva review al principio de la lista
    reviewForm.reset(); // Resetea el formulario

    const alertElement = document.createElement('div');
    alertElement.className = 'alert alert-success mt-3';
    alertElement.textContent = 'Calificación guardada!';
    reviewForm.appendChild(alertElement);

    setTimeout(() => {
        alertElement.remove();
    }, 3000);
});

