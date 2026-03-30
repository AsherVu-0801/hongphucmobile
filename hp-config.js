import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyc8MWtMsXawqP9nrvqKX41AIBFFCBr6Apo",
  authDomain: "hongphucmobile-d5cdc.firebaseapp.com",
  projectId: "hongphucmobile-d5cdc",
  storageBucket: "hongphucmobile-d5cdc.firebasestorage.app",
  messagingSenderId: "411853835431",
  appId: "1:411853835431:web:57afda5a2b39748dffdf82",
  measurementId: "G-01GWY8T3KS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productsCol = collection(db, "products");
const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';
let currentFilter = 'all';
let selectedBase64 = "";

// Xử lý Kéo Thả & Preview
const fileInput = document.getElementById('p-file');
const imgPreview = document.getElementById('img-preview');
const previewContainer = document.getElementById('preview-container');
const dropZone = document.getElementById('drop-zone');

if (fileInput) {
    fileInput.onchange = (e) => handleFile(e.target.files[0]);
    // Hiệu ứng kéo thả
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

function listenToProducts() {
    const q = query(productsCol, orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(currentFilter !== 'all') products = products.filter(p => p.category === currentFilter);

        const list = document.getElementById('product-list');
        list.innerHTML = products.map(p => `
            <div class="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative overflow-hidden">
                <div class="h-40 overflow-hidden rounded-xl mb-3 bg-gray-50">
                    <img src="${p.img}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                </div>
                <h4 class="font-bold text-gray-800 text-sm h-10 overflow-hidden leading-tight mb-1 uppercase tracking-tighter">${p.name}</h4>
                <div class="text-emerald-600 font-black text-lg mb-2">${p.price}</div>
                <div class="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                    <span class="bg-gray-50 px-2 py-0.5 rounded border border-gray-100">Mới 100%</span>
                    <span class="text-emerald-500 italic font-black">Có sẵn</span>
                </div>
                ${isAdmin ? `<button onclick="deleteProduct('${p.id}')" class="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center">×</button>` : ''}
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
    const btn = document.getElementById('btn-add-product');

    if(!name || !price || !selectedBase64) return alert("M ơi nhập đủ Tên, Giá và thả Ảnh vào đã!");

    btn.innerText = "ĐANG LƯU...";
    btn.disabled = true;

    try {
        await addDoc(productsCol, { name, price, category: cate, img: selectedBase64, createdAt: Date.now() });
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
window.deleteProduct = async (id) => { if(confirm("Xóa nhé m?")) await deleteDoc(doc(db, "products", id)); };

listenToProducts();
