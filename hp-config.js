import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// 1. Hàm Upload ảnh bí mật (chọn file từ máy -> lấy link)
async function uploadToCloud(file) {
    const formData = new FormData();
    formData.append("image", file);
    // Sử dụng API tạm để lấy link ảnh nhanh
    const res = await fetch("https://api.imgbb.com/1/upload?key=67f1396f423985558d92634d5f47029b", {
        method: "POST",
        body: formData
    });
    const data = await res.json();
    return data.data.url;
}

// 2. Lắng nghe sản phẩm & Filter
function listenToProducts() {
    const q = query(productsCol, orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Logic lọc theo danh mục
        if(currentFilter !== 'all') {
            products = products.filter(p => p.category === currentFilter);
        }

        const list = document.getElementById('product-list');
        list.innerHTML = products.map(p => `
            <div class="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative overflow-hidden">
                <div class="h-40 overflow-hidden rounded-xl mb-3">
                    <img src="${p.img}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                </div>
                <h4 class="font-bold text-gray-800 text-sm h-10 overflow-hidden leading-tight mb-1">${p.name}</h4>
                <div class="text-red-600 font-black text-base mb-2">${p.price}</div>
                <div class="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
                    <span class="bg-gray-100 px-2 py-0.5 rounded">Mới 100%</span>
                    <span class="bg-green-50 text-green-600 px-2 py-0.5 rounded italic">Có sẵn</span>
                </div>
                ${isAdmin ? `<button onclick="deleteProduct('${p.id}')" class="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center">×</button>` : ''}
            </div>
        `).join('');

        if (isAdmin) {
            document.getElementById('admin-panel').classList.remove('hidden');
            document.getElementById('btn-toggle-admin').classList.remove('hidden');
        }
    });
}

// 3. Xử lý thêm sản phẩm
window.addProduct = async () => {
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const cate = document.getElementById('p-category').value;
    const fileInput = document.getElementById('p-file');
    const saveBtn = document.getElementById('btn-add-product');

    if(!name || !price || !fileInput.files[0]) return alert("M ơi nhập đủ tên, giá và chọn ảnh hộ t cái!");

    saveBtn.innerText = "ĐANG TẢI ẢNH LÊN...";
    saveBtn.disabled = true;

    try {
        const imgUrl = await uploadToCloud(fileInput.files[0]);
        await addDoc(productsCol, {
            name, price, category: cate, img: imgUrl, createdAt: Date.now()
        });
        alert("Đã đăng bán thành công!");
        location.reload(); // Reset cho lẹ
    } catch (e) { alert("Lỗi rồi: " + e.message); }
};

// 4. Logic Sidebar
window.filterCate = (cate) => {
    currentFilter = cate;
    // Cập nhật giao diện nút Sidebar
    document.querySelectorAll('.cate-btn').forEach(btn => btn.classList.remove('active-cate'));
    event.currentTarget.classList.add('active-cate');
    listenToProducts();
};

// Gán sự kiện
document.getElementById('btn-add-product').onclick = window.addProduct;
document.getElementById('p-file').onchange = (e) => {
    document.getElementById('file-status').innerText = "✅ Đã nhận: " + e.target.files[0].name;
};
window.deleteProduct = async (id) => {
    if(confirm("Xóa nhé m?")) await deleteDoc(doc(db, "products", id));
};

listenToProducts();
