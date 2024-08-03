let cart = [];
let products = [];

document.addEventListener('DOMContentLoaded', () => {
    // Cargar productos del archivo JSON
    fetch('recursos/json/Productos.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            displayProducts(products);
            fillBrandCheckboxes(products);
            loadCart(); // Cargar el carrito desde localStorage
            updateCartCount(); // Actualizar el contador del carrito
        })
        .catch(error => console.error('Error al cargar los productos:', error));

    // Cargar detalles del producto seleccionado
    if (window.location.pathname.includes('detalles.html')) {
        const selectedProductId = localStorage.getItem('selectedProductId');
        if (selectedProductId) {
            fetch('recursos/json/Productos.json')
                .then(response => response.json())
                .then(data => {
                    const selectedProduct = data.find(product => product.ID === selectedProductId);
                    if (selectedProduct) {
                        document.getElementById('product-image').src = selectedProduct.Imagen;
                        document.getElementById('product-name').textContent = selectedProduct.Nombre;
                        document.getElementById('product-description').textContent = selectedProduct.Descripcion;
                        document.getElementById('product-price').textContent = selectedProduct.Precio;
                        document.getElementById('product-brand').textContent = selectedProduct.Marca;
                        document.getElementById('product-category').textContent = selectedProduct.Categoria;
                    } else {
                        console.error('Producto no encontrado.');
                    }
                })
                .catch(error => console.error('Error al cargar los detalles del producto:', error));
        } else {
            console.error('No se encontró el ID del producto seleccionado.');
        }
    }
});

function displayProducts(productArray) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    productArray.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'col-md-4 mb-4';
        productCard.innerHTML = `
            <div class="card">
                <img src="${product.Imagen}" class="card-img-top" alt="${product.Nombre}">
                <div class="card-body">
                    <h5 class="card-title">${product.Nombre}</h5>
                    <p class="card-text">${product.Descripcion.substring(0, 60)}...</p>
                    <p><strong>Precio: Q${product.Precio}</strong></p>
                    <button class="btn btn-primary add-to-cart" data-id="${product.ID}">
                        <i class="fas fa-cart-plus"></i> Agregar
                    </button>
                    <button class="btn btn-secondary view-details" data-id="${product.ID}">
                        <i class="fas fa-info-circle"></i> Ver detalles
                    </button>
                </div>
            </div>
        `;
        productList.appendChild(productCard);
    });

    // Manejar evento de clic en "Agregar al Carrito"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-id');
            const product = products.find(p => p.ID === productId);
            const cartItem = cart.find(item => item.ID === productId);
            if (cartItem) {
                cartItem.quantity++;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            updateCartCount();
            updateCartModal();
            saveCart(); // Guardar el carrito después de cualquier cambio
            swal({
                title: "Producto añadido al carrito!",
                text: `Cantidad: ${cartItem ? cartItem.quantity : 1}`,
                icon: "success",
                buttons: {
                    goToCart: {
                        text: "Ir al carrito",
                        value: "goToCart",
                    },
                    continueShopping: {
                        text: "Seguir comprando",
                        value: "continueShopping",
                    },
                }
            }).then((value) => {
                switch (value) {
                    case "goToCart":
                        $('#cartModal').modal('show');
                        break;
                    case "continueShopping":
                        break;
                }
            });
        });
    });

    // Manejar evento de clic en "Ver Detalles"
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-id');
            localStorage.setItem('selectedProductId', productId);
            window.location.href = 'detalles.html';
        });
    });
}

function updateCartCount() {
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').innerText = totalQuantity;
}

function updateCartModal() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;
    cart.forEach(product => {
        const productSubtotal = product.quantity * parseFloat(product.Precio);
        subtotal += productSubtotal;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item mb-3';
        
        cartItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <img src="${product.Imagen}" class="img-thumbnail" alt="Producto" style="width: 50px; height: 50px;">
                    <h5>${product.Nombre}</h5>
                    <p>${product.Descripcion}</p>
                    <p>Precio: Q${product.Precio}</p>
                    <p>Cantidad: 
                        <button class="btn btn-sm btn-outline-secondary decrease-quantity" data-id="${product.ID}">-</button> 
                        <span>${product.quantity}</span> 
                        <button class="btn btn-sm btn-outline-secondary increase-quantity" data-id="${product.ID}">+</button>
                    </p>
                </div>
                <button class="btn btn-danger remove-from-cart" data-id="${product.ID}"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    const total = subtotal;

    document.getElementById('cart-subtotal').textContent = `Q${subtotal.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `Q${total.toFixed(2)}`;

    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-id');
            const cartItem = cart.find(item => item.ID === productId);
            if (cartItem) {
                cartItem.quantity++;
                updateCartModal();
                updateCartCount(); // Actualizar el contador del carrito
                saveCart(); // Guardar cambios en el carrito
            }
        });
    });

    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-id');
            const cartItem = cart.find(item => item.ID === productId);
            if (cartItem && cartItem.quantity > 1) {
                cartItem.quantity--;
            } else {
                cart = cart.filter(p => p.ID !== productId);
            }
            updateCartModal();
            updateCartCount(); // Actualizar el contador del carrito
            saveCart(); // Guardar cambios en el carrito
        });
    });

    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-id');
            cart = cart.filter(p => p.ID !== productId);
            updateCartModal();
            updateCartCount(); // Actualizar el contador del carrito
            saveCart(); // Guardar cambios en el carrito
            swal("Producto eliminado del carrito!", "", "success");
        });
    });
}

function fillBrandCheckboxes(products) {
    const brandCheckboxes = document.getElementById('brand-checkboxes');
    const brands = [...new Set(products.map(product => product.Marca))].sort();

    brands.forEach(brand => {
        const brandCheckbox = document.createElement('div');
        brandCheckbox.className = 'form-check';
        brandCheckbox.innerHTML = `
            <input class="form-check-input" type="checkbox" name="brand" value="${brand}" id="${brand}">
            <label class="form-check-label" for="${brand}">${brand}</label>
        `;
        brandCheckboxes.appendChild(brandCheckbox);
    });
}

function fillCategoryCheckboxes(products) {
    const categoryCheckboxes = document.getElementById('category-checkboxes');
    const categories = [...new Set(products.map(product => product.Categoria))].sort();

    categories.forEach(category => {
        const categoryCheckbox = document.createElement('div');
        categoryCheckbox.className = 'form-check';
        categoryCheckbox.innerHTML = `
            <input class="form-check-input" type="checkbox" name="category" value="${category}" id="${category}">
            <label class="form-check-label" for="${category}">${category}</label>
        `;
        categoryCheckboxes.appendChild(categoryCheckbox);
    });
}


function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
}
