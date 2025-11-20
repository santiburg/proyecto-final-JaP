const CATEGORIES_URL = "http://localhost:3000/cats/cat.json";
const PUBLISH_PRODUCT_URL = "http://localhost:3000/sell/publish.json";
const PRODUCTS_URL = "http://localhost:3000/cats_products/";
const PRODUCT_INFO_URL = "http://localhost:3000/products/";
const PRODUCT_INFO_COMMENTS_URL = "http://localhost:3000/products_comments/";
const CART_INFO_URL = "http://localhost:3000/user_cart/";
const CART_BUY_URL = "http://localhost:3000/cart/buy.json";
const EXT_TYPE = ".json";
const TOKEN = localStorage.getItem('token');

fetch('http://localhost:3000/protected', {
  method: 'GET',  // Ensure the method is GET
  headers: {
    'Authorization': `${TOKEN}`
  }
})
.then(response => {
  if (response.status === 403 && !(window.location.pathname.endsWith('/login.html') || window.location.pathname.endsWith('/register.html'))) {
    window.location.href = "login.html";
  }
  else{
    if(response.ok && window.location.pathname.endsWith('/login.html')){
      window.location.href = "my-profile.html";
    }
    var menuOffcanvas = document.getElementById("loginInicio");
    menuOffcanvas.setAttribute("data-bs-toggle", "offcanvas");
    menuOffcanvas.setAttribute("data-bs-target", "#offcanvasRight");
    menuOffcanvas.setAttribute("aria-controls", "offcanvasRight");

    menuOffcanvas.innerHTML = localStorage.getItem("email");

    document.getElementById("logoutButton").addEventListener("click", function () {
      localStorage.clear();
      localStorage.clear();
      window.location.href = "login.html";
    })
  }
})


// Referencia a setItem original
const originalSetItem = localStorage.setItem;

// Sobreescribo el setItem
localStorage.setItem = function (key, value) {
    originalSetItem.apply(this, arguments);

    // Create and dispatch the custom event
    const event = new Event('localStorageChange');
    event.key = key;
    event.newValue = value;
    window.dispatchEvent(event);
};

// Timer para evitar recursión al actualizar el carrito.
let antiRecursionTimer;

// Escucha cambios en localstorage, y actualiza el carrito si es el item que cambia.
window.addEventListener('localStorageChange', (event) => {
    if (event.key === 'cart') {
        // Limpia el timer
        clearTimeout(antiRecursionTimer);

        // Crea el timer
        antiRecursionTimer = setTimeout(debouncedUpdateCart, 300); // timer para evitar iteraciones innecesarias.
    }
});

//Código con el fetch para actualizar el carrito
const debouncedUpdateCart = () => {
    try {
        let cart = JSON.parse(localStorage.getItem('cart'));

            // Iterate through each product and send individual requests
            cart.forEach(product => {
                const payload = {
                    email: localStorage.getItem('email'),
                    product_id: product.item.id,
                    count: product.quantity
                };

                fetch('http://localhost:3000/cart', {
                    method: 'POST',
                    headers: {
                        'Authorization': `${TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload) // Send the individual product update
                })
                .then(response => response.json())
                .then(data => console.log('Response:', data))
                .catch(error => console.error('Error:', error));
            });
        
    } catch (error) {
        console.error('Error:', error);
    }
};



document.addEventListener("DOMContentLoaded", function (e) {
  localStorage.getItem('cart') ? document.getElementById("cartBadge").textContent = JSON.parse(localStorage.getItem('cart')).length || 0 : document.getElementById("cartBadge").textContent = 0

  const darkModeSwitch = document.getElementById('darkModeSwitch');
  const body = document.body;
  const isDarkMode = localStorage.getItem('darkMode')

  if (window.matchMedia('(prefers-color-scheme: dark)').matches && !isDarkMode) {
    localStorage.setItem('darkMode', 'true')
    body.classList.add('dark-mode');
    darkModeSwitch.checked = true;
  } else if (!isDarkMode) {
    body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'false')
    darkModeSwitch.checked = false;
  }

  if (isDarkMode == 'true') {
    body.classList.add('dark-mode');
    darkModeSwitch.checked = true;
  }

  darkModeSwitch.addEventListener('change', () => {
    if (darkModeSwitch.checked) {
      body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
    } else {
      body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
    }
  });
})


let showSpinner = function () {
  document.getElementById("spinner-wrapper").style.display = "block";
}

let hideSpinner = function () {
  document.getElementById("spinner-wrapper").style.display = "none";
}


let getJSONData = function (url) {
  let result = {};
  showSpinner();
  return fetch(url,{
    headers:{
      'Authorization': `${TOKEN}`
    }
  })
  
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(function (response) {
      result.status = 'ok';
      result.data = response;
      hideSpinner();
      return result;
    })
    .catch(function (error) {
      result.status = 'error';
      result.data = error;
      hideSpinner();
      return result;
    });
}