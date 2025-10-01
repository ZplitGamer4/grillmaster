// ===== Firebase =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔑 Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDC5D9iZaqI78q2cnec6wwGvUuFU-jaRSw",
  authDomain: "grillmaster-43706.firebaseapp.com",
  projectId: "grillmaster-43706",
  storageBucket: "grillmaster-43706.appspot.com",
  messagingSenderId: "405120213849",
  appId: "1:405120213849:web:a1e75609d847a1412f6248",
  measurementId: "G-DG2QC0Z2XY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== Variables =====
let products = [];
let cart = [], currentCategory="Todas";
let isAdmin = false;

// ===== Elementos =====
const menuSection = document.getElementById("menu");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const catButtons = document.querySelectorAll(".cat-btn");

const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminPanel = document.getElementById("adminPanel");
const closeAdmin = document.getElementById("closeAdmin");
const loginBtn = document.getElementById("loginBtn");
const adminContent = document.getElementById("adminContent");
const productList = document.getElementById("productList");
const loginForm = document.getElementById("loginForm");
const viewClientBtn = document.getElementById("viewClientBtn");
const logoutBtn = document.getElementById("logoutBtn");
const addProductBtn = document.getElementById("addProduct");

const cartPanel = document.getElementById("cart");
const cartToggleBtn = document.getElementById("cartToggleBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
let cartOpen = false;

// ===== Carrito responsive =====
function updateCartUI() {
    if(window.innerWidth <= 768){
        cartPanel.style.position = "fixed";
        cartPanel.style.width = "80%";
        cartPanel.style.height = "100%";
        cartPanel.style.top = "0";
        cartPanel.style.left = "0";
        cartPanel.style.transform = cartOpen ? "translateX(0)" : "translateX(100%)";
        cartPanel.style.transition = "transform 0.3s";
        cartToggleBtn.style.display = "block";
    } else {
        cartPanel.style.position = "sticky";
        cartPanel.style.width = "320px";
        cartPanel.style.height = "calc(100vh - 100px)";
        cartPanel.style.top = "80px";
        cartPanel.style.left = "auto";
        cartPanel.style.transform = cartOpen ? "translateX(0)" : "translateX(340px)";
        cartPanel.style.transition = "transform 0.3s";
        cartToggleBtn.style.display = "block";
    }
}

cartToggleBtn.addEventListener("click", () => {
    cartOpen = !cartOpen;
    updateCartUI();
});
closeCartBtn.addEventListener("click", () => {
    cartOpen = false;
    updateCartUI();
});

// ===== Ventana resize =====
window.addEventListener("resize", updateCartUI);
updateCartUI();


// ===== Firestore: Cargar productos =====
async function loadProducts(){
    products = [];
    const querySnapshot = await getDocs(collection(db,"products"));
    querySnapshot.forEach(docSnap=>{
        products.push({...docSnap.data(), id: docSnap.id});
    });
    renderProducts();
}
loadProducts();

// ===== Render productos =====
function renderProducts(){
    menuSection.innerHTML="";
    const filtered = currentCategory==="Todas" ? products : products.filter(p=>p.cat===currentCategory);
    filtered.forEach((product)=>{
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML=`
            <img src="${product.img||'https://i.ibb.co/0GcWqrf/hamburguesa.jpg'}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.desc}</p>
            <p><b>$${product.price}</b></p>
            <button onclick="addToCart('${product.id}')">Agregar al pedido</button>
        `;
        menuSection.appendChild(card);
    });
}

// ===== Carrito =====
window.addToCart = function(id){
    const item = products.find(p => p.id===id);
    const exist = cart.find(p => p.id===id);
    if(exist) exist.qty++;
    else cart.push({...item, qty:1});
    renderCart();
}

function renderCart(){
    cartItems.innerHTML="";
    let total=0;
    cart.forEach((item,i)=>{
        total += item.price * item.qty;
        const li = document.createElement("li");
        li.innerHTML = `${item.name} x${item.qty} - $${item.price*item.qty} 
        <button onclick="removeCart(${i})">❌</button>`;
        cartItems.appendChild(li);
    });
    cartTotal.innerText = total;
    updateCartCount();
}
window.removeCart=function(i){cart.splice(i,1); renderCart();}
function updateCartCount() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById("cartCount").innerText = totalQty;
}

// ===== WhatsApp =====
document.getElementById("sendWhatsApp").addEventListener("click", ()=>{
    if(cart.length===0) return alert("Agrega productos primero");
    let msg = "Hola, quiero hacer el siguiente pedido:%0A";
    cart.forEach(item => {msg += `- ${item.name} x${item.qty} - $${item.price*item.qty}%0A`});
    let total = cart.reduce((a,b) => a + b.price * b.qty, 0);
    msg += `Total: $${total}%0ADirección: `;
    const waNumber="5211234567890";
    window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
});

// ===== Categorías =====
catButtons.forEach(btn=>{
    btn.addEventListener("click", ()=>{
        catButtons.forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.dataset.cat;
        renderProducts();
    });
});

// ===== Panel Admin =====
adminLoginBtn.addEventListener("click", ()=>{
    adminPanel.classList.remove("hidden");
    loginForm.style.display = "block";        // mostrar solo login
    adminContent.style.display = "none";      // ocultar todo lo demás
});

closeAdmin.addEventListener("click", ()=>{
    adminPanel.classList.add("hidden");
});

// ===== Login Admin =====
loginBtn.addEventListener("click", ()=>{
    const user = document.getElementById("adminUser").value;
    const pass = document.getElementById("adminPass").value;
    if(user==="admin" && pass==="12345"){
        isAdmin = true;
        loginForm.style.display = "none";        // ocultar login
        adminContent.style.display = "block";    // mostrar todo admin
        renderAdminProducts();
    } else alert("Usuario o contraseña incorrectos");
});

// ===== Logout Admin =====
logoutBtn.addEventListener("click", ()=>{
    isAdmin = false;
    adminContent.style.display = "none";       // ocultar todo admin
    loginForm.style.display = "block";         // mostrar login
    productList.innerHTML="";
});

// ===== Ver como cliente =====
viewClientBtn.addEventListener("click", ()=>{
    adminPanel.classList.add("hidden");        // ocultar panel completo
});

// ===== Inicialización =====
adminContent.style.display = "none";           // asegurar que al cargar no se vea nada
loginForm.style.display = "block";             // solo login visible



viewClientBtn.addEventListener("click", ()=>adminPanel.classList.add("hidden"));

// ===== Admin Funciones =====
function renderAdminProducts(){
    productList.innerHTML="";
    products.forEach((item)=>{
        const li = document.createElement("li");
        li.className = "product-admin-item";
        li.innerHTML=`
            ${item.name} ($${item.price}) - ${item.cat}
            <div>
                <button onclick="editProduct('${item.id}')">✏️</button>
                <button onclick="deleteProduct('${item.id}')">🗑️</button>
            </div>
        `;
        productList.appendChild(li);
    });
}

addProductBtn.addEventListener("click", async ()=>{
    if(!isAdmin) return;
    const name = document.getElementById("newName").value;
    const desc = document.getElementById("newDesc").value;
    const price = parseFloat(document.getElementById("newPrice").value);
    const img = document.getElementById("newImg").value||'https://i.ibb.co/0GcWqrf/hamburguesa.jpg';
    const cat = document.getElementById("newCat").value||"General";

    if(!name || !desc || isNaN(price)) return alert("Completa todos los campos correctamente");

    await addDoc(collection(db,"products"),{name,desc,price,img,cat});
    loadProducts();
    renderAdminProducts();
});

window.editProduct = async function(id){
    const item = products.find(p=>p.id===id);
    const newName = prompt("Nombre:", item.name);
    if(!newName) return;
    const newDesc = prompt("Descripción:", item.desc);
    if(!newDesc) return;
    const newPrice = parseFloat(prompt("Precio:", item.price));
    if(isNaN(newPrice)) return;
    const newImg = prompt("URL Imagen (opcional):", item.img) || 'https://i.ibb.co/0GcWqrf/hamburguesa.jpg';
    const newCat = prompt("Categoría:", item.cat) || "General";

    const ref = doc(db,"products",id);
    await updateDoc(ref,{name:newName,desc:newDesc,price:newPrice,img:newImg,cat:newCat});
    loadProducts();
    renderAdminProducts();
}

window.deleteProduct = async function(id){
    if(confirm("Eliminar producto?")){
        await deleteDoc(doc(db,"products",id));
        loadProducts();
        renderAdminProducts();
    }
}
