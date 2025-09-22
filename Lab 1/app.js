(function (){
    const STORAGE_KEY ="wf.cart";
    const FORM_KEY="wf.checkout"
    let cart = [];

    const addButtons = document.querySelectorAll(".add-to-cart");
    const cartList = document.getElementById("cart-items");
    const carTotalEl = document.getElementById("cart-total");
    const orderForm = document.getElementById("order-form");

    loadCart();
    renderCart();
    loadFormData();

    addButtons.forEach((btn) => {
        btn.addEventListener("click", onAddToCart);
    });
    cartList.addEventListener("click", onCartClick);
    cartList.addEventListener("change", onCartChange);
    if (orderForm){
        orderForm.addEventListener("submit", onCreateOrder);
        orderForm.addEventListener("input", onFormInput);
    }
    

    function onAddToCart(e){
        const btn = e.currentTarget;
        const card = btn.closest(".product-card");
        const id = btn.dataset.id || "";
        const title = card.querySelector(".product-tittle")?.textContent?.trim() || "Item";
        const priceText = card.querySelector(".product-price")?.textContent || "$0";
        const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;

        const existingIdenx = cart.findIndex((it) => it.id === id);
        if (existingIdenx >= 0){
            cart[existingIdenx].qty += 1;
        } else {
            cart.push({id, title, price, qty: 1});
        }
        saveCart();
        renderCart();
    }

    function renderCart(){
        cartList.innerHTML = "";
        let total = 0;

        cart.forEach((item) => {
            const li = document.createElement("li");
            li.dataset.id = item.id;

            const subtotal = item.price * item.qty;
            total += subtotal;

            li.innerHTML = `
                <div class="cart-line">
                    <span class="title">${item.title}</span>
                    <span class="price">$${item.price.toFixed(2)}</span>
                </div>
                <div class="cart-controls">
                    <button class="qty-decrease" data-id="${item.id}" aria-label="Decrease">-</button>
                    <input class="qty-input" type="number" min="1" value="${item.qty}" data-id="${item.id}">
                    <button class = "qty-increase" data-id = "${item.id}" aria-label="Increase">+</button>
                    <button class = "remove-item" data-id = "${item.id}">Remove</button>
                    <span class = "subtotal">$${subtotal.toFixed(2)}</span>
                </div>
            `;
            cartList.appendChild(li);
        });

        carTotalEl.textContent = `$${total.toFixed(2)}`;
    }

    function onCartClick(e){
        const id = e.target.dataset.id;
        if (!id) return;

        if (e.target.classList.contains("qty-decrease")){
            changeQty(id, -1);
        }

        if (e.target.classList.contains("qty-increase")){
            changeQty(id, +1);
        }

        if (e.target.classList.contains("remove-item")){
            const idx = cart.findIndex((it) => it.id === id);
            if (idx >= 0){
                cart.splice(idx, 1);
                saveCart();
                renderCart();
            }
        }
    }

    function onCartChange(e){
        if (!e.target.classList.contains("qty-input")) return;

        const id = e.target.dataset.id;
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        setQty(id, val);
    }

    function changeQty(id, delta){
        const it = cart.find((x) => x.id === id);

        if (!it) return;

        it.qty += delta;
        if (it.qty < 1) it.qty = 1;
        saveCart();
        renderCart();
    }

    function setQty(id, qty){
        const it = cart.find((x) => x.id === id);

        if (!it) return;

        it.qty = qty < 1 ? 1 : qty;
        saveCart();
        renderCart();
    }

    function onCreateOrder(e){
        e.preventDefault();

        if (cart.length === 0){
            alert("Your cart is empty!")
            return;
        }

        // Тут не знаю, просят именно, чтобы появилось сообщение "Заказ создан!"
        // но у меня уже вся страница на анлийском, так что, пусть будет так))
        alert("Order created! | Заказ создан!")

        cart = [];
        saveCart();
        renderCart();
        clearFormData();

        e.target.reset();
    }

    function saveCart(){
        try{
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        } catch (err) {}
    }

    function loadCart(){
        try{
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) cart = JSON.parse(raw) || [];
        } catch (err){
            cart = [];
        }
    }

    function onFormInput(){
        const data = {
            firstName: document.getElementById("firstName")?.value || "",
            lastName: document.getElementById("lastName")?.value || "",
            address: document.getElementById("address")?.value || "",
            phone: document.getElementById("phone")?.value || "",
        };
        saveFormData(data);
    }

    function saveFormData(data){
        try{
            localStorage.setItem(FORM_KEY, JSON.stringify(data));
        } catch (err) {}
    }

    function loadFormData(){
        try{
            const raw = localStorage.getItem(FORM_KEY);

            if (!raw) return;

            const data = JSON.parse(raw);
            if (data && typeof data === "object"){
                const f = document.getElementById("firstName");
                const l = document.getElementById("lastName");
                const a = document.getElementById("address");
                const p = document.getElementById("phone");
                if (f) f.value = data.firstName || "";
                if (l) l.value = data.lastName || "";
                if (a) a.value = data.address || "";
                if (p) p.value = data.phone || "";
            }
        } catch (err) {}
    }

    function clearFormData(){
        try {
            localStorage.removeItem(FORM_KEY);
        } catch (err){}
    }
})();