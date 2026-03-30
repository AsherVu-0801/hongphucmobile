// hp-config.js - REAL BACKEND cho HỒNG PHÚC Mobile
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. Cấu hình chìa khóa kết nối
const firebaseConfig = {
  apiKey: "AIzaSyc8MWtMsXawqP9nrvqKX41AIBFFCBr6Apo",
  authDomain: "hongphucmobile-d5cdc.firebaseapp.com",
  projectId: "hongphucmobile-d5cdc",
  storageBucket: "hongphucmobile-d5cdc.firebasestorage.app",
  messagingSenderId: "411853835431",
  appId: "1:411853835431:web:57afda5a2b39748dffdf82",
  measurementId: "G-01GWY8T3KS"
};

// 2. Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productsCol = collection(db, "products");

// 3. Kiểm tra quyền Admin (Chỉ hiện nút nếu link có ?admin=true)
const urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.get('admin') === 'true';

// 4. Hàm hiển thị sản phẩm (Lấy data Real-time từ Server)
function listenToProducts() {
    const q = query(productsCol, orderBy("createdAt", "desc"));
    
    // Lắng nghe thay đổi: Hễ trên Database có biến là web tự cập nhật
    onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const list = document.getElementById('product-list');
        if(!list) return;

        list.innerHTML = products.map(p => `
            <div class="bg-white p-3 rounded-xl shadow-sm border-t-4 border-emerald-500 relative">
                <img src="${p.img}" class="w-full h-44 object-cover rounded-lg mb-2">
                <h4 class="font-bold text-gray-800">${p.name}</h4>
                <p class="text-emerald-600 font-bold">${p.price}</p>
                <p class="text-[10px] text-gray-400">📍 Phan Rí Cửa</p>
                ${isAdmin ? `<button onclick="deleteProduct('${p.id}')" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 shadow flex items-center justify-center">×</button>` : ''}
            </div>
        `).join('');

        // Ẩn hiện bảng Admin dựa trên URL
        const adminPanel = document.getElementById('admin-panel');
        if(adminPanel) adminPanel.style.display = isAdmin ? 'block' : 'none';
        
        const adminBtnHeader = document.querySelector('button[onclick="toggleAdmin()"]');
        if(adminBtnHeader) adminBtnHeader.style.display = isAdmin ? 'block' : 'none';
    });
}

// 5. Hàm Thêm Sản Phẩm (Đẩy lên mây)
window.addProduct = async () => {
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const img = document.getElementById('p-img').value;

    if(name && price) {
        try {
            await addDoc(productsCol, {
                name,
                price,
                img: img || "https://via.placeholder.com/200?text=HongPhucMobile",
                createdAt: Date.now()
            });
            // Reset form
            document.getElementById('p-name').value = '';
            document.getElementById('p-price').value = '';
            document.getElementById('p-img').value = '';
            alert("Đã lưu lên Cloud Database thành công!");
        } catch (e) {
            alert("Lỗi rồi m ơi: " + e.message);
        }
    } else {
        alert("Nhập đủ tên với giá đã m!");
    }
};

// 6. Hàm Xóa Sản Phẩm (Xóa vĩnh viễn trên mây)
window.deleteProduct = async (id) => {
    if(confirm("Xóa máy này trên hệ thống luôn nhé?")) {
        try {
            await deleteDoc(doc(db, "products", id));
        } catch (e) {
            alert("Lỗi xóa: " + e.message);
        }
    }
};

// Chạy khởi tạo
listenToProducts();