import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyc8MWtMsXawqP9nrvqKX41AIBFFCBr6Apo",
  authDomain: "hongphucmobile-d5cdc.firebaseapp.com",
  databaseURL: "https://hongphucmobile-d5cdc-default-rtdb.firebaseio.com", // Link database của m
  projectId: "hongphucmobile-d5cdc",
  storageBucket: "hongphucmobile-d5cdc.firebasestorage.app",
  messagingSenderId: "411853835431",
  appId: "1:411853835431:web:57afda5a2b39748dffdf82"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const productsRef = ref(db, 'products');
const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';
let currentFilter = 'all';
let selectedBase64 = "";

// Kéo thả & Preview (Giữ nguyên logic cũ m thích)
const fileInput = document.getElementById('p-file');
const imgPreview = document.getElementById('img-preview');
const previewContainer = document.getElementById('preview-container');
const dropZone = document.getElementById('drop-zone');

if (fileInput) {
    fileInput.onchange = (e) => handleFile(e.target.files[0]);
    dropZone.ondragover = () => { dropZone.classList.add('dragover'); return false; };
    dropZone.ondragleave = () => { dropZone.classList.remove('dragover'); return false; };
    dropZone.ondrop = (e) => {
        dropZone.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
        return false;
    };
}

function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            selectedBase64 = event.target.result;
            imgPreview.src = selectedBase64;
            imgPreview.classList.remove('hidden');
            previewContainer.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
}

// Load sản phẩm từ Realtime Database
function listenToProducts() {
    onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        let products = [];
        if (data) {
            products = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            products.reverse(); // Đảo ngược để hàng mới lên đầu
        }

        if(currentFilter !== 'all') products = products.filter(p => p.category === currentFilter);

        const list = document.getElementById('product-list');
        list.innerHTML = products.map(p => `
            <div class="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative overflow-hidden">
                <div class="h-40 overflow-hidden rounded-xl mb-3 bg-gray-50 relative">
                    <img src="${p.img}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                    <div class="absolute top-2 left-2 ${p.status === 'used' ? 'bg-orange-500' : 'bg-emerald-500'} text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-tighter z-10">
                        ${p.status === 'used' ? 'Đã qua sử dụng' : 'Mới 100%'}
                    </div>
                </div>
                <h4 class="font-bold text-gray-800 text-sm h-10 overflow-hidden leading-tight mb-1 uppercase tracking-tighter">${p.name}</h4>
                <div class="text-emerald-600 font-black text-lg mb-2">${p.price}</div>
                <div class="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                    <span class="text-emerald-500 italic font-black uppercase">Có sẵn tại shop</span>
                </div>
                ${isAdmin ? `<button onclick="deleteProduct('${p.id}')" class="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center z-20">×</button>` : ''}
            </div>
        `).join('');

        if (isAdmin) {
            document.getElementById('admin-panel')?.classList.remove('hidden');
            document.getElementById('btn-toggle-admin')?.classList.remove('hidden');
        }
    });
}

window.addProduct = async () => {
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const cate = document.getElementById('p-category').value;
    const status = document.getElementById('p-status').value;
    const btn = document.getElementById('btn-add-product');

    if(!name || !price || !selectedBase64) return alert("M ơi nhập đủ thông tin m ơi!");

    btn.innerText = "ĐANG ĐĂNG...";
    btn.disabled = true;

    try {
        await push(productsRef, {
            name, price, category: cate, status: status, img: selectedBase64, createdAt: Date.now()
        });
        location.reload();
    } catch (e) { alert("Lỗi: " + e.message); btn.innerText = "THỬ LẠI"; btn.disabled = false; }
};

window.filterCate = (cate) => {
    currentFilter = cate;
    document.querySelectorAll('.cate-btn').forEach(btn => btn.classList.remove('active-cate'));
    event.currentTarget.classList.add('active-cate');
    listenToProducts();
};

document.getElementById('btn-add-product').onclick = window.addProduct;
window.deleteProduct = async (id) => { 
    if(confirm("Xóa máy này nhé m?")) {
        const itemRef = ref(db, `products/${id}`);
        await remove(itemRef);
    }
};

listenToProducts();
