// admin.js
import { db } from '../firebase.js';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', async () => {

  // DOM Elements
  const ordersBody = document.getElementById('ordersBody');
  const searchInput = document.getElementById('searchOrders');
  const logoutBtn = document.getElementById('logoutBtn');

  let ordersData = [];

  // ----------------- Logout -----------------
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      window.location.href = 'login.html';
    } catch (err) {
      console.error("Logout failed:", err);
      showAlert("Failed to logout.");
    }
  });

  // ----------------- Fetch Orders -----------------
  async function fetchOrders() {
  showSkeleton(); // 🔥 show animation

  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    hideSkeleton();
    renderOrders(ordersData);

  } catch (err) {
    hideSkeleton();
    console.error("Error fetching orders:", err);
    ordersBody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:red">Failed to load orders</td></tr>`;
  }
}


  // ----------------- Render Orders Table -----------------
  function renderOrders(data) {
    ordersBody.innerHTML = '';
    if (!data || data.length === 0) {
      ordersBody.innerHTML = `<tr><td colspan="7" style="text-align:center">No orders found</td></tr>`;
      return;
    }

    data.forEach(order => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td data-label="Name">${order.name || '-'}</td>
        <td data-label="Contact">${order.contact || '-'}</td>
        <td data-label="Address">${order.address || '-'}</td>
        <td data-label="Product">${order.product || '-'}</td>
        <td data-label="Price">${order.price || '-'}</td>
        <td data-label="Ordered At">${formatTimestamp(order.timestamp)}</td>
        <td data-label="Action"><button class="delete-btn" data-id="${order.id}">Delete</button></td>
      `;
      ordersBody.appendChild(tr);
    });
    document.getElementById('totalOrders').textContent = data.length;
const today = new Date().toDateString();
document.getElementById('todayOrders').textContent =
  data.filter(o => new Date(o.timestamp?.seconds*1000).toDateString()===today).length;

  }

  // ----------------- Format Timestamp -----------------
  function formatTimestamp(ts) {
    if (!ts) return '-';
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString();
    return new Date(ts).toLocaleString();
  }

  // ----------------- Delete Order -----------------
  let deleteTargetId = null;

ordersBody.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    deleteTargetId = e.target.dataset.id;
    document.getElementById('confirmPopup').classList.add('show');
  }
});

document.querySelector('.confirm-cancel').addEventListener('click', () => {
  document.getElementById('confirmPopup').classList.remove('show');
  deleteTargetId = null;
});

document.querySelector('.confirm-delete').addEventListener('click', async () => {
  if (!deleteTargetId) return;

  try {
    await deleteDoc(doc(db, 'orders', deleteTargetId));
    document.getElementById('confirmPopup').classList.remove('show');
    fetchOrders();
    showAlert("Order deleted successfully 🗑️");
  } catch (err) {
    console.error("Failed to delete order:", err);
    showAlert("Failed to delete order ❌");
  }

  deleteTargetId = null;
});

// ---------- THEMED ALERT HELPER ----------
function showAlert(message) {
  // Create alert box if not exists
  let alertBox = document.querySelector('.alert-box');
  if(!alertBox){
    alertBox = document.createElement('div');
    alertBox.className = 'alert-box';
    alertBox.innerHTML = `<div class="alert-content">
      <div class="alert-msg"></div>
      <button>OK</button>
    </div>`;
    document.body.appendChild(alertBox);

    // Close on button click
    alertBox.querySelector('button').addEventListener('click', () => {
      alertBox.classList.remove('show');
    });
  }

  alertBox.querySelector('.alert-msg').textContent = message;
  alertBox.classList.add('show');
}

  // ----------------- Search Orders -----------------
  searchInput.addEventListener('input', () => {
    const queryText = searchInput.value.toLowerCase();
    const filtered = ordersData.filter(o =>
      (o.name || '').toLowerCase().includes(queryText) ||
      (o.contact || '').toLowerCase().includes(queryText) ||
      (o.product || '').toLowerCase().includes(queryText)
    );
    renderOrders(filtered);
  });

//  --------------------------
  function showSkeleton(){
  ordersBody.innerHTML = '';
  for(let i=0;i<6;i++){
    const tr = document.createElement('tr');
    tr.className = 'skeleton-row';
    tr.innerHTML = `
      <td><div class="skeleton short"></div></td>
      <td><div class="skeleton medium"></div></td>
      <td><div class="skeleton long"></div></td>
      <td><div class="skeleton medium"></div></td>
      <td><div class="skeleton short"></div></td>
      <td><div class="skeleton medium"></div></td>
      <td><div class="skeleton short"></div></td>
    `;
    ordersBody.appendChild(tr);
  }
}

function hideSkeleton(){
  ordersBody.innerHTML = '';
}

  // ----------------- Initial Load -----------------
  fetchOrders();
});
