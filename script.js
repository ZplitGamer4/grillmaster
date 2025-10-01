// ===== Productos iniciales o guardados =====
let products = JSON.parse(localStorage.getItem("products")) || [
    {name:"Hamburguesa Clásica",desc:"Carne, lechuga, tomate, queso",price:120,img:"https://i.ibb.co/0GcWqrf/hamburguesa.jpg",cat:"Hamburguesas"},
    {name:"Papas Fritas",desc:"Crocantes y saladas",price:50,img:"https://i.ibb.co/9y9T9ZY/papas.jpg",cat:"Papas"},
    {name:"Coca-Cola",desc:"Refresco 500ml",price:30,img:"https://i.ibb.co/qY7tV3c/coca.jpg",cat:"Bebidas"}
];

let cart=[], currentCategory="Todas";

// ===== Elementos =====
const menuSection=document.getElementById("menu");
const cartItems=document.getElementById("cartItems");
const cartTotal=document.getElementById("cartTotal");
const catButtons=document.querySelectorAll(".cat-btn");


// ===== Render productos =====
function renderProducts(){
    menuSection.innerHTML="";
    const filtered=currentCategory==="Todas"?products:products.filter(p=>p.cat===currentCategory);
    filtered.forEach((product,index)=>{
        const card=document.createElement("div");
        card.className="product-card";
        card.innerHTML=`
            <img src="${product.img||'https://i.ibb.co/0GcWqrf/hamburguesa.jpg'}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.desc}</p>
            <p><b>$${product.price}</b></p>
            <button onclick="addToCart(${index})">Agregar al pedido</button>
        `;
        menuSection.appendChild(card);
    });
}
renderProducts();

// ===== Categorías =====
catButtons.forEach(btn=>{
    btn.addEventListener("click",()=>{
        catButtons.forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory=btn.dataset.cat;
        renderProducts();
    });
});

// ===== Carrito =====
function addToCart(index){
    const item=products[index];
    const exist=cart.find(p=>p.name===item.name);
    if(exist) exist.qty++;
    else cart.push({...item,qty:1});
    renderCart();
}
function renderCart(){
    cartItems.innerHTML="";
    let total=0;
    cart.forEach((item,i)=>{
        total+=item.price*item.qty;
        const li=document.createElement("li");
        li.innerHTML=`${item.name} x${item.qty} - $${item.price*item.qty} <button onclick="removeCart(${i})">❌</button>`;
        cartItems.appendChild(li);
    });
    cartTotal.innerText=total;
}
function removeCart(i){cart.splice(i,1); renderCart();}

// ===== WhatsApp =====
document.getElementById("sendWhatsApp").addEventListener("click",()=>{
    if(cart.length===0) return alert("Agrega productos primero");
    let msg="Hola, quiero hacer el siguiente pedido:%0A";
    cart.forEach(item=>{msg+=`- ${item.name} x${item.qty} - $${item.price*item.qty}%0A`});
    let total=cart.reduce((a,b)=>a+b.price*b.qty,0);
    msg+=`Total: $${total}%0ADirección: `;
    const waNumber="5211234567890"; // Cambia por tu número
    window.open(`https://wa.me/${waNumber}?text=${msg}`,"_blank");
});

// ===== Panel Admin =====
const adminLoginBtn=document.getElementById("adminLoginBtn");
const adminPanel=document.getElementById("adminPanel");
const closeAdmin=document.getElementById("closeAdmin");
const loginBtn=document.getElementById("loginBtn");
const adminContent=document.getElementById("adminContent");
const productList=document.getElementById("productList");
const loginForm=document.getElementById("loginForm");
const viewClientBtn=document.getElementById("viewClientBtn");
const logoutBtn=document.getElementById("logoutBtn");
const addProductBtn=document.getElementById("addProduct");
const addProductFields = [
    "newName","newDesc","newPrice","newImg","newCat"
].map(id => document.getElementById(id));

// ===== Ocultar todo el contenido admin al inicio =====
adminContent.classList.add("hidden");
addProductBtn.disabled = true;
addProductFields.forEach(input => input.style.display="none"); // oculta inputs

productList.innerHTML = "";

// ===== Abrir y cerrar panel =====
adminLoginBtn.addEventListener("click",()=>adminPanel.classList.remove("hidden"));
closeAdmin.addEventListener("click",()=>adminPanel.classList.add("hidden"));

// ===== Login =====
loginBtn.addEventListener("click", ()=>{
    const user=document.getElementById("adminUser").value;
    const pass=document.getElementById("adminPass").value;
    if(user==="admin" && pass==="12345"){
        loginForm.classList.add("hidden");
        adminContent.classList.remove("hidden");
        addProductBtn.disabled = false;

        // Mostrar inputs de agregar producto
        addProductFields.forEach(input => input.style.display="block");

        renderAdminProducts();
    } else alert("Usuario o contraseña incorrectos");
});

// ===== Cerrar sesión =====
logoutBtn.addEventListener("click", ()=>{
    adminContent.classList.add("hidden");
    loginForm.classList.remove("hidden");
    addProductBtn.disabled = true;

    // Ocultar inputs de agregar producto
    addProductFields.forEach(input => input.style.display="none");

    // Limpiar inputs y lista
    document.getElementById("adminUser").value="";
    document.getElementById("adminPass").value="";
    productList.innerHTML="";
});

// ===== Funciones Admin =====
function renderAdminProducts(){
    productList.innerHTML="";
    products.forEach((item,index)=>{
        const li=document.createElement("li");
        li.className="product-admin-item";
        li.innerHTML=`
            ${item.name} ($${item.price}) - ${item.cat}
            <div>
                <button onclick="editProduct(${index})">✏️</button>
                <button onclick="deleteProduct(${index})">🗑️</button>
            </div>
        `;
        productList.appendChild(li);
    });
}


// ===== Añadir producto =====
addProductBtn.addEventListener("click",()=>{
    if(adminContent.classList.contains("hidden")) return;

    const name=document.getElementById("newName").value;
    const desc=document.getElementById("newDesc").value;
    const price=parseFloat(document.getElementById("newPrice").value);
    const img=document.getElementById("newImg").value||'https://i.ibb.co/0GcWqrf/hamburguesa.jpg';
    const cat=document.getElementById("newCat").value||"General";

    if(!name||!desc||isNaN(price)) return alert("Completa todos los campos correctamente");

    products.push({name,desc,price,img,cat});
    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();
    renderAdminProducts();

    document.getElementById("newName").value="";
    document.getElementById("newDesc").value="";
    document.getElementById("newPrice").value="";
    document.getElementById("newImg").value="";
    document.getElementById("newCat").value="";
});

// ===== Editar producto =====
function editProduct(index){
    const item=products[index];
    const newName=prompt("Nombre:",item.name);
    if(!newName) return;
    const newDesc=prompt("Descripción:",item.desc);
    if(!newDesc) return;
    const newPrice=parseFloat(prompt("Precio:",item.price));
    if(isNaN(newPrice)) return;
    const newImg=prompt("URL Imagen (opcional):",item.img)||'https://i.ibb.co/0GcWqrf/hamburguesa.jpg';
    const newCat=prompt("Categoría:",item.cat)||"General";

    products[index]={name:newName,desc:newDesc,price:newPrice,img:newImg,cat:newCat};
    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();
    renderAdminProducts();
}

// ===== Eliminar producto =====
function deleteProduct(index){
    if(confirm("Eliminar producto?")){
        products.splice(index,1);
        localStorage.setItem("products", JSON.stringify(products));
        renderProducts();
        renderAdminProducts();
    }
}
