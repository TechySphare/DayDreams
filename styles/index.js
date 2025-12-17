// ================== FIREBASE ==================
import { db } from '../firebase.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ========= Data =========
const products = [
  {name:"Bracelet", price:"149₹", oldPrice:"100₹", imgs:["others/images/product/bracelet01-1.jpg"], desc:"Handmade premium bracelet"},
  {name:"Bracelet", price:"149₹", oldPrice:"90₹", imgs:["others/images/product/bracelet02-1.jpg"], desc:"Handmade premium bracelet"},
  {name:"Bracelet", price:"149₹", oldPrice:"", imgs:["others/images/product/bracelet03-1.jpg"], desc:"Handmade premium bracelet"},
  {name:"Bracelet", price:"149₹", oldPrice:"", imgs:["others/images/product/bracelet04-1.jpg"], desc:"Handmade premium bracelet"},
  {name:"Bracelet", price:"", oldPrice:"", imgs:["others/images/product/bracelet05-1.jpg"], desc:"Not available"},
  {name:"Bracelet", price:"149₹", oldPrice:"", imgs:["others/images/product/bracelet06-1.jpg"], desc:"Handmade premium bracelet"},
  {name:"Bracelet", price:"149₹", oldPrice:"", imgs:["others/images/product/bracelet07-1.jpg"], desc:"Handmade premium bracelet"},
  {name:"PhoneCharm", price:"99₹", oldPrice:"", imgs:["others/images/product/phonechram01-1.jpg"], desc:"Handmade phonecharm"},
  {name:"PhoneCharm", price:"99₹", oldPrice:"", imgs:["others/images/product/phonechram02-3.jpg","others/images/product/phonechram02-2.jpg","others/images/product/phonechram02-1.jpg"], desc:"Handmade phonecharm"},
  {name:"PhoneCharm", price:"99₹", oldPrice:"", imgs:["others/images/product/phonechram03-1.jpg"], desc:"Handmade phonecharm"},
  {name:"PhoneCharm", price:"99₹", oldPrice:"", imgs:["others/images/product/phonechram04-1.jpg"], desc:"Handmade phonecharm"},
  {name:"PhoneCharm", price:"99₹", oldPrice:"", imgs:["others/images/product/phonechram05-1.jpg"], desc:"Handmade phonecharm"},
  {name:"BagCharm", price:"169₹", oldPrice:"499₹", imgs:["others/images/product/bagchram01-1.jpg"], desc:"Stylish bag charm"},
  {name:"BagCharm", price:"169₹", oldPrice:"", imgs:["others/images/product/bagchram02-1.jpg"], desc:"Stylish bag charm"},
  {name:"BagCharm", price:"169₹", oldPrice:"", imgs:["others/images/product/bagchram03-1.jpg"], desc:"Stylish bag charm"},
  {name:"BagCharm", price:"169₹", oldPrice:"", imgs:["others/images/product/bagchram04-1.jpg"], desc:"Stylish bag charm"},
  {name:"BagCharm", price:"169₹", oldPrice:"", imgs:["others/images/product/bagchram05-1.jpg"], desc:"Stylish bag charm"},
  {name:"BagCharm", price:"169₹", oldPrice:"", imgs:["others/images/product/bagchram06-1.jpg"], desc:"Stylish bag charm"},
  {name:"BagCharm", price:"169₹", oldPrice:"", imgs:["others/images/product/bagchram07-1.jpg"], desc:"Stylish bag charm"},
  {name:"BagCharm", price:"169₹", oldPrice:"", imgs:["others/images/product/bagchram08-1.jpg"], desc:"Stylish bag charm"},
  {name:"Necklace", price:"249₹", oldPrice:"", imgs:["others/images/product/necklace01-1.jpg"], desc:"Beautiful handmade necklace"},
  {name:"Necklace", price:"249₹", oldPrice:"", imgs:["others/images/product/necklace02-1.jpg"], desc:"Beautiful handmade necklace"},
  {name:"Necklace", price:"249₹", oldPrice:"", imgs:["others/images/product/necklace03-1.jpg"], desc:"Beautiful handmade necklace"},
];

// ========= DOM refs =========
const productGrid = document.getElementById('productGrid');

// ========= Render products =========
function escapeHtml(str){ return String(str||'').replace(/[&<>"'`=\/]/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'}[s])); }

function createCard(p, idx){
  const div = document.createElement('article');
  div.className = 'card';
  div.setAttribute('tabindex','0');
  div.innerHTML = `
    <div class="thumb" aria-hidden="true">
      <img id="view" loading="lazy" src="${p.imgs[0]}" alt="${p.name} image">
    </div>
    <div class="meta">
      <div class="title">${escapeHtml(p.name)}</div>
      <div class="desc">${escapeHtml(p.desc)}</div>
      <div class="price-row">
        <div>
          ${p.oldPrice ? `<div class="old">${escapeHtml(p.oldPrice)}</div>` : ''}
          <div class="price">${p.price || 'Not Available'}</div>
        </div>
        <div class="btn-row">
          <button class="view-btn" data-index="${idx}">View</button>
          <button class="order-small" data-order="${idx}">✦</button>
        </div>
      </div>
    </div>
  `;
  div.querySelector('#view').addEventListener('click',()=> openModal(idx));
  div.querySelector('.view-btn').addEventListener('click',()=> openModal(idx));
  div.querySelector('[data-order]').addEventListener('click',(e)=>{ e.preventDefault(); openOrderWindow(idx); });
  div.addEventListener('keydown',(ev)=>{ if(ev.key==='Enter') openModal(idx); });
  return div;
}

function renderGrid(list=products){
  productGrid.innerHTML='';
  const frag=document.createDocumentFragment();
  list.forEach((p,i)=> frag.appendChild(createCard(p,i)));
  productGrid.appendChild(frag);
}

renderGrid();

// ========= Modal & Order system =========
const modalWrap = document.getElementById('modalWrap');
const modalBox = document.getElementById('modalBox');
const modalImg = document.getElementById('modalImg');
const modalName = document.getElementById('modalName');
const modalPrice = document.getElementById('modalPrice');
const modalDesc = document.getElementById('modalDesc');
const thumbRow = document.getElementById('thumbRow');
const modalClose = document.getElementById('modalClose');
const modalOverlay = document.getElementById('modalOverlay');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const modalOrderBtn = document.getElementById('modalOrderBtn');

let currentIndex=0;
let currentImgs=[];

function openModal(idx){
  currentIndex=idx;
  currentImgs=products[idx].imgs.slice();
  updateModal();
  modalWrap.style.display='flex';
  modalBox.classList.add('show');
  document.body.style.overflow='hidden';
}

function closeModal(){
  modalBox.classList.remove('show');
  modalWrap.style.display='none';
  document.body.style.overflow='';
}

function updateModal(){
  const p = products[currentIndex];
  modalImg.src = currentImgs[0];
  modalImg.alt = p.name;
  modalName.textContent = p.name;
  modalPrice.textContent = p.price || 'Not Available';
  modalDesc.textContent = p.desc || '';
  
  // Thumbnails
  thumbRow.innerHTML='';
  currentImgs.forEach((im,i)=>{
    const el=document.createElement('div');
    el.className='small-thumb'+(i===0?' active':'');
    el.setAttribute('role','button');
    el.innerHTML=`<img src="${im}" alt="${p.name} thumb ${i+1}">`;
    el.addEventListener('click',()=> setModalImage(i));
    thumbRow.appendChild(el);
  });
}

function setModalImage(i){
  currentImgs.unshift(...currentImgs.splice(i));
  modalImg.src=currentImgs[0];
  Array.from(thumbRow.children).forEach((el, idx)=> el.classList.toggle('active', idx===0));
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);
prevBtn.addEventListener('click',()=>{ currentImgs.unshift(currentImgs.pop()); updateModal(); });
nextBtn.addEventListener('click',()=>{ currentImgs.push(currentImgs.shift()); updateModal(); });
modalOrderBtn.addEventListener('click',()=>{ openOrderWindow(currentIndex); });

// ========= ORDER =========
let selectedProductIndex = null;

function openOrderWindow(idx){
  selectedProductIndex = idx;
  document.getElementById('inputPopup').classList.add('show');
}

document.querySelector('.popup-cancel').addEventListener('click',()=>{
  document.getElementById('inputPopup').classList.remove('show');
});

document.querySelector('.popup-submit').addEventListener('click',async ()=>{
  const name = document.getElementById('userName').value.trim();
  const contact = document.getElementById('userContact').value.trim();
  const address = document.getElementById('userAddress').value.trim();

  if(!name || !contact || !address){
    showAlert("Please fill all details ✨");
    return;
  }

  const p = products[selectedProductIndex];
  
  try {
    await addDoc(collection(db,"orders"),{
      name, contact, address,
      product:p.name,
      price:p.price,
      timestamp:new Date()
    });
    document.getElementById('inputPopup').classList.remove('show');
    showAlert("Order submitted successfully 💖");
    launchConfetti();
    document.getElementById('userName').value='';
    document.getElementById('userContact').value='';
    document.getElementById('userAddress').value='';
  } catch(e){
    showAlert("Failed to submit order 😢");
  }
});

// ========= SEARCH =========
const searchInput = document.getElementById('globalSearch');
const categorySelect = document.getElementById('categorySelect');

function normalizeText(v){ return (v||'').toString().toLowerCase().trim(); }
 
function runSearch(query, category='all'){
  query=normalizeText(query);
  const cat=normalizeText(category);
  const filtered=products.filter(p=>{
    const name=normalizeText(p.name);
    const desc=normalizeText(p.desc);
    const inCategory=(cat==='all')?true:(name.includes(cat)||desc.includes(cat));
    const matches=query===''?true:(name.includes(query)||desc.includes(query));
    return inCategory && matches;
  });
  renderGrid(filtered);
}

searchInput.addEventListener('input',()=> runSearch(searchInput.value, categorySelect.value));
categorySelect.addEventListener('change',()=> runSearch(searchInput.value, categorySelect.value));

// ---------- ALERT HELPER ----------
function showAlert(message) {
  let alertBox = document.querySelector('.alert-box');
  if(!alertBox){
    alertBox = document.createElement('div');
    alertBox.className = 'alert-box';
    alertBox.innerHTML = `<div class="alert-content">
      <div class="alert-msg"></div>
      <button>OK</button>
    </div>`;
    document.body.appendChild(alertBox);
    alertBox.querySelector('button').addEventListener('click', () => alertBox.classList.remove('show'));
  }
  alertBox.querySelector('.alert-msg').textContent = message;
  alertBox.classList.add('show');
}
// ---------- CONFETTI EFFECT ----------
function launchConfetti() {
  const duration = 1800;
  const end = Date.now() + duration;

  const colors = ['#ff69b4', '#ffd1dc', '#ffc0cb', '#ffb6c1', '#ffa6c9'];

  (function frame() {
    const timeLeft = end - Date.now();
    if (timeLeft <= 0) return;

    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors
    });

    requestAnimationFrame(frame);
  })();
}


