// admin.js
import { db, auth } from '../firebase.js';
import {
  collection,
  deleteDoc,
  doc,
  query,
  orderBy,
  updateDoc,
  getDocs,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

/* ================== ADMIN LOGIN (RUN FIRST) ================== */
(async function adminLoginGuard() {

  if (localStorage.getItem('adminLoggedIn') === 'true') {
    document.getElementById('loginModal')?.remove();
    return;
  }

  const modal = document.getElementById('loginModal');
  const userInput = document.getElementById('adminUser');
  const passInput = document.getElementById('adminPass');
  const loginBtn = document.getElementById('loginBtn');
  const errorBox = document.getElementById('loginError');

  userInput.focus();

  loginBtn.onclick = async () => {
    const username = userInput.value.trim();
    const password = passInput.value.trim();

    if (!username || !password) {
      errorBox.textContent = "Empty";
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Checking...";

    try {
      const q = query(
        collection(db, 'admins'),
        where('username', '==', username)
      );

      const snap = await getDocs(q);

      if (snap.empty || snap.docs[0].data().password !== password) {
        errorBox.textContent = "Invalid credentials";
        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
        return;
      }

      // ✅ SUCCESS
      localStorage.setItem('adminLoggedIn', 'true');
      modal.remove();
      showAlert("Login successful ✅");

    } catch (err) {
      console.error(err);
      errorBox.textContent = showAlert("Login failed");
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  };

})();


//=======================================

document.addEventListener('DOMContentLoaded', async () => {

  // ================= DOM ELEMENTS =================
  const ordersBody = document.getElementById('ordersBody');
  const searchInput = document.getElementById('searchOrders');
  const logoutBtn = document.getElementById('logoutBtn');
  const exportBtn = document.getElementById('exportCSV');
  const fromDateInput = document.getElementById('fromDate');
  const toDateInput = document.getElementById('toDate');
  const clearDateBtn = document.getElementById('clearDateFilter');
  const statusFilter = document.getElementById('statusFilter');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const drawer = document.getElementById('orderDrawer');
  const drawerContent = document.getElementById('drawerContent');
  const closeDrawerBtn = document.getElementById('closeDrawer');

  let ordersData = [];
  let deleteTargetId = null;

  // ================= LOGOUT (FIXED) =================
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'index.html';
  });

  // ================= EXPORT CSV =================
  exportBtn.addEventListener('click', () => {
    if (!ordersData || ordersData.length === 0) {
      showAlert("No orders to export ❌");
      return;
    }

    const csvRows = [];
    csvRows.push(['Name', 'Contact', 'Address', 'Product', 'Price', 'Ordered At', 'Status']);

    ordersData.forEach(o => {
      csvRows.push([
        o.name || '-',
        o.contact || '-',
        o.address || '-',
        o.product || '-',
        o.price || '-',
        formatTimestamp(o.timestamp),
        o.status || 'Pending'
      ]);
    });

    const csvString = csvRows
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showAlert("CSV exported successfully ✅");
  });

  // ================= FETCH ORDERS =================
  function fetchOrders() {
    showSkeleton();

    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, orderBy('timestamp', 'desc'));

    onSnapshot(q, snapshot => {
      ordersData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      hideSkeleton();

      const filtered = applyAllFilters(ordersData);
      renderOrders(filtered);
      updateAnalytics(filtered);

    }, err => {
      hideSkeleton();
      console.error("Realtime fetch failed:", err);
      ordersBody.innerHTML =
        `<tr><td colspan="7" style="text-align:center;color:red">Failed to load orders</td></tr>`;
    });
  }

  // ================= APPLY ALL FILTERS =================
  function applyAllFilters(data) {
    let filtered = [...data];

    const statusVal = statusFilter.value;
    if (statusVal !== "All") {
      filtered = filtered.filter(o => (o.status || "Pending") === statusVal);
    }

    filtered = filterByDate(filtered);

    const q = searchInput.value.toLowerCase();
    if (q) {
      filtered = filtered.filter(o =>
        (o.name || '').toLowerCase().includes(q) ||
        (o.contact || '').toLowerCase().includes(q) ||
        (o.product || '').toLowerCase().includes(q)
      );
    }

    return filtered;
  }

  // ================= UPDATE ANALYTICS =================
  function updateAnalytics(data) {
    if (!data || data.length === 0) {
      document.getElementById('totalRevenue').textContent = '₹0';
      document.getElementById('weeklyOrders').textContent = '0';
      if (window.statusChart) {
        window.statusChart.data.datasets[0].data = [0, 0];
        window.statusChart.update();
      }
      return;
    }

    let totalRevenue = data.reduce((sum, o) => {
      let price = o.price
        ? parseInt(o.price.replace(/[^0-9]/g, '')) || 0
        : 0;
      return sum + price;
    }, 0);

    document.getElementById('totalRevenue').textContent = `₹${totalRevenue}`;

    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    const weeklyOrders = data.filter(o => {
      const ts = o.timestamp?.seconds
        ? new Date(o.timestamp.seconds * 1000)
        : new Date(o.timestamp);
      return ts >= weekAgo && ts <= now;
    }).length;

    document.getElementById('weeklyOrders').textContent = weeklyOrders;

    const pending = data.filter(o => (o.status || 'Pending') === 'Pending').length;
    const done = data.filter(o => (o.status || 'Pending') === 'Done').length;

    const ctx = document.getElementById('statusChart').getContext('2d');

    if (window.statusChart) {
      window.statusChart.data.datasets[0].data = [pending, done];
      window.statusChart.update();
    } else {
      window.statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Pending', 'Done'],
          datasets: [{
            data: [pending, done],
            backgroundColor: ['#ff4da6', '#4ade80']
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  }

  // ================= DATE FILTER =================
  function filterByDate(data) {
    const from = fromDateInput.value ? new Date(fromDateInput.value) : null;
    const to = toDateInput.value ? new Date(toDateInput.value) : null;

    return data.filter(order => {
      if (!order.timestamp?.seconds) return false;
      const orderDate = new Date(order.timestamp.seconds * 1000);
      if (from && orderDate < from) return false;
      if (to && orderDate > to) return false;
      return true;
    });
  }

  fromDateInput.addEventListener('change', () => {
    const filtered = applyAllFilters(ordersData);
    renderOrders(filtered);
    updateAnalytics(filtered);
  });

  toDateInput.addEventListener('change', () => {
    const filtered = applyAllFilters(ordersData);
    renderOrders(filtered);
    updateAnalytics(filtered);
  });

  clearDateBtn.addEventListener('click', () => {
    fromDateInput.value = '';
    toDateInput.value = '';
    const filtered = applyAllFilters(ordersData);
    renderOrders(filtered);
    updateAnalytics(filtered);
  });

  // ================= STATUS FILTER =================
  statusFilter.addEventListener('change', () => {
    const filtered = applyAllFilters(ordersData);
    renderOrders(filtered);
    updateAnalytics(filtered);
  });

  // ================= SEARCH =================
  searchInput.addEventListener('input', () => {
    const filtered = applyAllFilters(ordersData);
    renderOrders(filtered);
    updateAnalytics(filtered);
  });

  // ================= RENDER TABLE =================
  function renderOrders(data) {
    ordersBody.innerHTML = '';

    if (!data || data.length === 0) {
      ordersBody.innerHTML =
        `<tr><td colspan="7" style="text-align:center">No orders found</td></tr>`;
      return;
    }

    data.forEach(order => {
      const status = order.status || "Pending";

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td data-label="Name">${order.name || '-'}</td>
        <td data-label="Contact">${order.contact || '-'}</td>
        <td data-label="Address">${order.address || '-'}</td>
        <td data-label="Product">${order.product || '-'}</td>
        <td data-label="Price">${order.price || '-'}</td>
        <td data-label="Ordered At">${formatTimestamp(order.timestamp)}</td>
        <td data-label="Action">
          <select class="status-select" data-id="${order.id}">
            <option value="Pending" ${status==="Pending"?"selected":""}>Pending</option>
            <option value="Done" ${status==="Done"?"selected":""}>Done</option>
          </select>
          <button class="delete-btn" data-id="${order.id}">Delete</button>
        </td>
      `;
      ordersBody.appendChild(tr);
    });
  }

  // ================= FORMAT TIMESTAMP =================
  function formatTimestamp(ts) {
    if (!ts) return '-';
    return ts.seconds
      ? new Date(ts.seconds * 1000).toLocaleString()
      : new Date(ts).toLocaleString();
  }

  // ================= DELETE ORDER =================
  ordersBody.addEventListener('click', e => {
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
      showAlert("Order deleted successfully 🗑️");
    } catch (err) {
      console.error(err);
      showAlert("Failed to delete order ❌");
    }

    deleteTargetId = null;
  });

  // ================= STATUS UPDATE =================
  ordersBody.addEventListener('change', async e => {
    if (!e.target.classList.contains('status-select')) return;

    const id = e.target.dataset.id;
    const value = e.target.value;

    try {
      await updateDoc(doc(db, 'orders', id), { status: value });
      showAlert(`Order marked ${value} ✅`);
    } catch {
      showAlert("Failed to update status ❌");
    }
  });

  // ================= ALERT =================
  function showAlert(message) {
    let alertBox = document.querySelector('.alert-box');

    if (!alertBox) {
      alertBox = document.createElement('div');
      alertBox.className = 'alert-box';
      alertBox.innerHTML = `
        <div class="alert-content">
          <div class="alert-msg"></div>
          <button>OK</button>
        </div>`;
      document.body.appendChild(alertBox);
      alertBox.querySelector('button').onclick =
        () => alertBox.classList.remove('show');
    }

    alertBox.querySelector('.alert-msg').textContent = message;
    alertBox.classList.add('show');
  }

  // ================= SKELETON =================
  function showSkeleton() {
    ordersBody.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const tr = document.createElement('tr');
      tr.className = 'skeleton-row';
      tr.innerHTML = `
        <td><div class="skeleton short"></div></td>
        <td><div class="skeleton medium"></div></td>
        <td><div class="skeleton long"></div></td>
        <td><div class="skeleton medium"></div></td>
        <td><div class="skeleton short"></div></td>
        <td><div class="skeleton medium"></div></td>
        <td><div class="skeleton short"></div></td>`;
      ordersBody.appendChild(tr);
    }
  }

  function hideSkeleton() {
    ordersBody.innerHTML = '';
  }

  // ================= ORDER DRAWER =================
  ordersBody.addEventListener('click', e => {
    const tr = e.target.closest('tr');
    if (!tr || e.target.classList.contains('delete-btn') || e.target.tagName === 'SELECT') return;

    const id = tr.querySelector('.delete-btn')?.dataset.id;
    const order = ordersData.find(o => o.id === id);
    if (!order) return;

    drawerContent.innerHTML = `
🧾 ORDER DETAILS
────────────────────────
<div class="drawer-item"><strong>Name:</strong> ${order.name || '-'}</div>
<div class="drawer-item"><strong>Contact:</strong> <a href="tel:${order.contact || ''}" style="text-decoration:none;">${order.contact || '-'}</a></div>
<div class="drawer-item"><strong>Address:</strong> ${order.address || '-'}</div>
<div class="drawer-item"><strong>Product:</strong> ${order.product || '-'}</div>
<div class="drawer-item"><strong>Price:</strong> ${order.price || '-'}</div>
<div class="drawer-item"><strong>Status:</strong> ${order.status || 'Pending'}</div>
<div class="drawer-item"><strong>Ordered At:</strong> ${formatTimestamp(order.timestamp)}</div>
<div class="drawer-item"><strong>Order ID:</strong> ${order.id}</div>
    `;

    drawer.classList.add('show');
  });

  closeDrawerBtn.addEventListener('click', () => drawer.classList.remove('show'));
  drawer.addEventListener('click', e => e.target === drawer && drawer.classList.remove('show'));

  // ================= DARK MODE =================
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️ Light Mode';
  }

  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const enabled = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', enabled ? 'enabled' : 'disabled');
    darkModeToggle.textContent = enabled ? '☀️ Light Mode' : '🌙 Dark Mode';
  });

  // ================= INIT =================
  fetchOrders();

});
