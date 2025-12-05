// ======== Popup Multi Image Viewer ========

let currentImages = [];
let currentIndex = 0;

function showProduct(name,price,img,desc){

  // If only 1 image passed, still convert into array
  currentImages = typeof img==="string" ? [img] : img;
  currentIndex = 0;

  updateImage();

  document.getElementById("popup-name").innerHTML = name;
  document.getElementById("popup-price").innerHTML = price;
  document.getElementById("popup-desc").innerHTML = desc;

  let username = "daydream_beads_";
  let message = `Hello, I want to order ${name} for ${price}`;
  document.getElementById("insta-link").href =
  `https://www.instagram.com/direct/t/${username}?text=${encodeURIComponent(message)}`;

  document.getElementById("popup-box").style.display="block";
  document.getElementById("overlay").style.display="block";
}

// Update main image
function updateImage(){
  document.getElementById("popup-img").src = currentImages[currentIndex];
}

function nextImg(){
  currentIndex = (currentIndex + 1) % currentImages.length;
  updateImage();
}

function prevImg(){
  currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
  updateImage();
}

// Swipe support (mobile)
let startX=0;
document.getElementById("popup-box").addEventListener("touchstart",e=>startX=e.touches[0].clientX);
document.getElementById("popup-box").addEventListener("touchend",e=>{
    let endX=e.changedTouches[0].clientX;
    if(endX < startX-50) nextImg();
    if(endX > startX+50) prevImg();
});

function closePopup(){
  document.getElementById("popup-box").style.display="none";
  document.getElementById("overlay").style.display="none";
}
document.getElementById("overlay").onclick = closePopup;

//<============== Buy Box ===================>

document.addEventListener("DOMContentLoaded", function(){

  // Full product list with images, price, description
  const products = [
    {name:"Bracelet", price:"149₹", img:"others/images/product/bracelet01-1.jpg",img1:"others/images/product/bracelet02-1.jpg", desc:"Handmade premium bracelet"},
   {name:"Bracelet", price:"149₹", img:"others/images/product/bracelet02-1.jpg", desc:"Handmade premium bracelet"},
   {name:"Bracelet", price:"149₹", img:"others/images/product/bracelet03-1.jpg", desc:"Handmade premium bracelet"},
   {name:"Bracelet", price:"149₹", img:"others/images/product/bracelet04-1.jpg", desc:"Handmade premium bracelet"},
   {name:"Bracelet", price:"", img:"others/images/product/bracelet05-1.jpg", desc:"note Available"},
   {name:"Bracelet", price:"149₹", img:"others/images/product/bracelet06-1.jpg", desc:"Handmade premium bracelet"},
   {name:"Bracelet", price:"149₹", img:"others/images/product/bracelet07-1.jpg", desc:"Handmade premium bracelet"},
  {name:"PhoneChram", price:"99₹", img:"others/images/product/phonechram01-1.jpg", desc:"Handmade phonecharm"},
    {name:"PhoneChram", price:"99₹", img:"others/images/product/phonechram02-3.jpg", desc:"Handmade phonecharm"},
  {name:"PhoneChram", price:"99₹", img:"others/images/product/phonechram03-1.jpg", desc:"Handmade phonecharm"},
  {name:"PhoneChram", price:"99₹", img:"others/images/product/phonechram04-1.jpg", desc:"Handmade phonecharm"},
  {name:"PhoneChram", price:"99₹", img:"others/images/product/phonechram05-1.jpg", desc:"Handmade phonecharm"},
   {name:"BagChram", price:"169₹", img:"others/images/product/bagchram01-1.jpg", desc:"Stylish bag charm"},
   {name:"BagChram", price:"169₹", img:"others/images/product/bagchram02-1.jpg", desc:"Stylish bag charm"},
   {name:"BagChram", price:"169₹", img:"others/images/product/bagchram03-1.jpg", desc:"Stylish bag charm"},
   {name:"BagChram", price:"169₹", img:"others/images/product/bagchram04-1.jpg", desc:"Stylish bag charm"},
   {name:"BagChram", price:"169₹", img:"others/images/product/bagchram05-1.jpg", desc:"Stylish bag charm"},
    {name:"BagChram", price:"169₹", img:"others/images/product/bagchram06-1.jpg", desc:"Stylish bag charm"},
   {name:"BagChram", price:"169₹", img:"others/images/product/bagchram07-1.jpg", desc:"Stylish bag charm"},
   {name:"BagChram", price:"169₹", img:"others/images/product/bagchram08-1.jpg", desc:"Stylish bag charm"},
    {name:"Necklace", price:"249₹", img:"others/images/product/necklace01-1.jpg", desc:"Beautiful handmade necklace"},
  {name:"Necklace", price:"249₹", img:"others/images/product/necklace02-1.jpg", desc:"Beautiful handmade necklace"},
  {name:"Necklace", price:"249₹", img:"others/images/product/necklace03-1.jpg", desc:"Beautiful handmade necklace"},
  ];

  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const popupSearch = document.getElementById("popupSearch");
  const resultList = document.getElementById("resultList");
  const closeSearch = document.getElementById("closeSearch");

  //<======================= Search-panel ==================>
  
  // Show search results
  function showSearchResults(query){
      query = query.toLowerCase().trim();
      if(query === ""){
          popupSearch.style.display = "none";
          return;
      }

      const filtered = products.filter(p => p.name.toLowerCase().includes(query));

      resultList.innerHTML = "";
      if(filtered.length>0){
          filtered.forEach(p=>{
              resultList.innerHTML += `
                <div class="search-result" onclick="showProduct('${p.name}','${p.price}','${p.img}','${p.desc}')">
                  <img src="${p.img}">
                  <div class="result-info">
                    <h4>${p.name}</h4>
                    <h5>Price: ${p.price}</h5>
                    <p>${p.desc}</p>
                  </div>
                  <a class="order-btn" href="https://www.instagram.com/direct/t/daydream_beads_?text=${encodeURIComponent('Hello, I want to order '+p.name+' for '+p.price)}" target="_blank">Order</a>
                </div>
              `;
          });
      } else {
          resultList.innerHTML = "<p>No product found</p>";
      }

      popupSearch.style.display = "flex";
  }

  searchInput.addEventListener("input", ()=>showSearchResults(searchInput.value));
  searchBtn.addEventListener("click", ()=>showSearchResults(searchInput.value));
  closeSearch.addEventListener("click", ()=>popupSearch.style.display="none");
  document.addEventListener("keydown", e=>{if(e.key==="Escape") popupSearch.style.display="none"});
});

