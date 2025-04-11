const productListContainer = document.getElementById('product-list');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const localStorageKey = 'shoppingCart';

let products = [];
let cart = loadCartFromStorage();

// 1. Fetch Product Data
async function fetchProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Error fetching products:', error);
        productListContainer.innerHTML = '<p>Failed to load products.</p>';
    }
}

// Render Products
function renderProducts() {
    productListContainer.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div>
                <h3>${product.title}</h3>
                <p>Price: $${product.price.toFixed(2)}</p>
                <p>Category: ${product.category}</p>
                <button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
            </div>
        </div>
    `).join('');

    // Add event listeners to the "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });
}

// 4. Persist Cart with localStorage (Load)
function loadCartFromStorage() {
    const storedCart = localStorage.getItem(localStorageKey);
    return storedCart ? JSON.parse(storedCart) : [];
}

// 4. Persist Cart with localStorage (Save)
function saveCartToStorage() {
    localStorage.setItem(localStorageKey, JSON.stringify(cart));
}

// 3. Add to Cart
function handleAddToCart(event) {
    const productId = parseInt(event.target.dataset.productId);
    const selectedProduct = products.find(product => product.id === productId);

    if (selectedProduct) {
        const existingCartItem = cart.find(item => item.id === productId);

        if (existingCartItem) {
            existingCartItem.quantity++;
        } else {
            cart.push({ ...selectedProduct, quantity: 1 });
        }

        saveCartToStorage();
        renderCart();
    }
}

// 5. Cart Management: Render Cart
function renderCart() {
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        cartTotalElement.textContent = 'Total: $0.00';
        return;
    }

    cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');
        cartItemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="product-image">
            <div>
                <h4>${item.title}</h4>
                <p>Price: $${item.price.toFixed(2)}</p>
                <div>
                    <button class="quantity-btn minus" data-product-id="${item.id}">-</button>
                    <span>Quantity: <span class="item-quantity">${item.quantity}</span></span>
                    <button class="quantity-btn plus" data-product-id="${item.id}">+</button>
                </div>
                <button class="remove-item-btn" data-product-id="${item.id}">Remove</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemDiv);
    });

    // Add event listeners for quantity updates and removal
    const quantityButtons = document.querySelectorAll('.quantity-btn');
    quantityButtons.forEach(button => {
        button.addEventListener('click', updateQuantity);
    });

    const removeButtons = document.querySelectorAll('.remove-item-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', removeItem);
    });

    updateTotal();
}

// 5. Cart Management: Update Quantity
function updateQuantity(event) {
    const productId = parseInt(event.target.dataset.productId);
    const operation = event.target.classList.contains('plus') ? 'increment' : 'decrement';
    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        if (operation === 'increment') {
            cartItem.quantity++;
        } else if (operation === 'decrement' && cartItem.quantity > 1) {
            cartItem.quantity--;
        } else if (operation === 'decrement' && cartItem.quantity === 1) {
            // If quantity is 1 and decrement is clicked, remove the item
            removeItem(event);
            return;
        }
        saveCartToStorage();
        renderCart();
    }
}

// 5. Cart Management: Remove Items
function removeItem(event) {
    const productId = parseInt(event.target.dataset.productId);
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    renderCart();
}

// 5. Cart Management: Total Cost
function updateTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
}

// On page load:
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    renderCart(); // Load and render the cart from localStorage
});