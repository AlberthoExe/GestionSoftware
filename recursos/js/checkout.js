// JavaScript para manejar el proceso de pago en la página de checkout
document.addEventListener('DOMContentLoaded', () => {
    // Simulación de productos del carrito
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Mostrar productos del carrito en el checkout
    displayCheckoutItems(cart);

    // Actualizar subtotal y total
    updateTotals(cart);

    // Cambiar formulario según el método de pago seleccionado
    document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'delivery') {
                document.getElementById('delivery-form').style.display = 'block';
                document.getElementById('card-payment-form').style.display = 'none';
            } else {
                document.getElementById('delivery-form').style.display = 'none';
                document.getElementById('card-payment-form').style.display = 'block';
            }
        });
    });

    // Manejar la confirmación del pago
    document.getElementById('confirm-payment-btn').addEventListener('click', () => {
        const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;

        if (selectedMethod === 'delivery') {
            // Validar y procesar el formulario de pago al recibir
            const name = document.getElementById('delivery-name').value;
            const phone = document.getElementById('delivery-phone').value;
            const address = document.getElementById('delivery-address').value;
            const dpi = document.getElementById('delivery-dpi').value;
            const company = document.getElementById('delivery-company').value;

            if (!name || !phone || !address || !dpi || !company) {
                swal("Error", "Por favor, completa todos los campos para Pago al Recibir.", "error");
                return;
            }

            swal("Pago Confirmado", "Tu pedido será procesado y enviado con Pago al Recibir.", "success");
        } else {
            // Validar y procesar el formulario de pago con tarjeta
            const name = document.getElementById('card-name').value;
            const phone = document.getElementById('card-phone').value;
            const address = document.getElementById('card-address').value;
            const dpi = document.getElementById('card-dpi').value;
            const company = document.getElementById('card-company').value;
            const cardNumber = document.getElementById('cardNumber').value;
            const cardExpiry = document.getElementById('cardExpiry').value;
            const cardCVC = document.getElementById('cardCVC').value;

            if (!name || !phone || !address || !dpi || !company || !cardNumber || !cardExpiry || !cardCVC) {
                swal("Error", "Por favor, completa todos los campos para Pago con Tarjeta.", "error");
                return;
            }

            swal("Pago Confirmado", "Tu pago ha sido procesado con éxito con Tarjeta.", "success");
        }

        // Limpiar el carrito después de confirmar el pago
        localStorage.removeItem('cart');
        document.getElementById('checkout-items').innerHTML = '<p>Tu carrito está vacío.</p>';
        updateTotals([]);
    });
});

function displayCheckoutItems(cart) {
    const checkoutItemsContainer = document.getElementById('checkout-items');
    checkoutItemsContainer.innerHTML = '';

    cart.forEach(product => {
        const productSubtotal = product.quantity * parseFloat(product.Precio);

        const checkoutItem = document.createElement('div');
        checkoutItem.className = 'checkout-item mb-3';
        checkoutItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <img src="recursos/image/${product.Imagen}" class="img-thumbnail" alt="Producto" style="width: 50px; height: 50px;">
                    <h5>${product.Nombre}</h5>
                    <p>${product.Descripcion}</p>
                    <p>Precio: Q${product.Precio}</p>
                    <p>Cantidad: <span>${product.quantity}</span></p>
                    <p>Subtotal: Q${productSubtotal.toFixed(2)}</p>
                </div>
            </div>
        `;
        checkoutItemsContainer.appendChild(checkoutItem);
    });
}

function updateTotals(cart) {
    let subtotal = cart.reduce((sum, product) => sum + product.quantity * parseFloat(product.Precio), 0);
    let total = subtotal; // Si hay más costos o impuestos, añadirlos aquí

    document.getElementById('checkout-subtotal').textContent = `Q${subtotal.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `Q${total.toFixed(2)}`;
}
