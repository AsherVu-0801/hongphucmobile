// hp-config.js - REAL BACKEND cho HỒNG PHÚC Mobile
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. Cấu hình (Đã xóa dấu phẩy thừa cho m)
const firebaseConfig = {
  apiKey: "AIzaSyc8MWtMsXawqP9nrvqKX41AIBFFCBr6Apo",
  authDomain: "hongphucmobile-d5cdc.firebaseapp.com",
  projectId: "hongphucmobile-d5cdc",
  storageBucket: "hongphucmobile-d5cdc.firebasestorage.app",
  messagingSenderId: "411853835431",
  appId: "1:411853835431:web:57afda5a2b39748dffdf82",
  measurementId: "G-01GWY8T3KS"
};

// 2. Khởi tạo
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productsCol = collection(db, "products");

// 3. Kiểm tra Admin
const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

// 4. Hàm hiển thị (Real-time)
function listenToProducts() {
    const q = query(productsCol, orderBy("createdAt", "desc"));
    
    onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const list = document.getElementById('product-list');
        if(!list) return;

        list.innerHTML = products.map(p => `
            <div class="bg-white p-3 rounded-xl shadow-sm border-t-4 border-emerald-500 relative group">
                <img src="${p.img}" class="w-full h-44 object-cover rounded-lg mb-2">
                <h4 class="font-bold text-gray-800">${p.name}</h4>
                <p class="text-emerald-600 font-bold">${p.price}</p>
                <p class="text-[10px] text-gray-400">📍 Phan Rí Cửa</p>
                ${isAdmin ? `<button onclick="deleteProduct('${p.id}')" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 shadow-lg flex items-center justify-center hover:bg-red-600">×</button>` : ''}
            </div>
        `).join('');

        // FIX LỖI HIỆN NÚT: Dùng ID chính xác từ index.html của m
        const adminPanel = document.getElementById('admin-panel');
        const adminBtnHeader = document.getElementById('btn-toggle-admin');
        
        if (isAdmin) {
            if(adminPanel) adminPanel.classList.remove('hidden');
            if(adminBtnHeader) adminBtnHeader.classList.remove('hidden');
        }
    });
}

// 5. Hàm Thêm (Gán vào window để HTML gọi được)
window.addProduct = async () => {
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const img = document.getElementById('p-img').value;

    if(name && price) {
        try {
            await addDoc(productsCol, {
                name, price,
                img: img || "https://via.placeholder.com/200?text=HongPhucMobile",
                createdAt: Date.now()
            });
            document.getElementById('p-name').value = '';
            document.getElementById('p-price').value = '';
            document.getElementById('p-img').value = '';
            alert("Đã lưu lên Cloud!");
        } catch (e) { alert("Lỗi: " + e.message); }
    } else { alert("Nhập đủ tên và giá m ơi!"); }
};

// Gán sự kiện click cho nút "LƯU LÊN CLOUD" trong index.html
const saveBtn = document.getElementById('btn-add-product');
if(saveBtn) saveBtn.onclick = window.addProduct;

// 6. Hàm Xóa
window.deleteProduct = async (id) => {
    if(confirm("Xóa máy này nhé m?")) {
        try { await deleteDoc(doc(db, "products", id)); } 
        catch (e) { alert("Lỗi xóa: " + e.message); }
    }
};

// Hàm ẩn hiện Admin Panel khi bấm nút
window.toggleAdmin = () => {
    const panel = document.getElementById('admin-panel');
    if(panel) panel.classList.toggle('hidden');
};

const btnToggle = document.getElementById('btn-toggle-admin');
if(btnToggle) btnToggle.onclick = window.toggleAdmin;

listenToProducts();
