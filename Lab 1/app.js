(function (){
    const cart = [];

    const addButtons = document.querySelectorAll(".add-to-cart");
    const cartList = document.getElementById("cart-items");
    const carTotalEl = document.getElementById("cart-total");

    addButtons.forEach((btn) => {
        btn.addEventListener("click", onAddToCart);
    });

    function onAddToCart(e){
        const btn = e.currentTarget;
        const card = btn.closest(".product-card");
        const id = btn.dataset.id || "";
        const title = card.querySelector(".product-title")?.textContent?.trim() || "Item";
        const priceText = card.querySelector(".product-price")?.textContent || "$0";
        const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;

        const existingIdenx = cart.findIndex((it) => it.id === id);
        if (existingIdenx >= 0){
            cart[existingIdenx].qty += 1;
        } else {
            cart.push({id, title, price, qty: 1});
        }
        renderCart();
    }

    function renderCart(){
        cartList.innerHTML = "";
        let total = 0;

        cart.forEach((item) => {
            const li = document.createElement("li");
            const subtotal = item.price * item.qty;
            total += subtotal;
            li.textContent = `${item.title} x${item.qty} - $${subtotal.toFixed(2)}`;
            cartList.appendChild(li);
        });

        carTotalEl.textContent = `$${total.toFixed(2)}`;
    }
})();