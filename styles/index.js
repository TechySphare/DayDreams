// POPUP FUNCTION
function showProduct(name,price,img,desc){
  document.getElementById("popup-name").innerHTML = name;
  document.getElementById("popup-price").innerHTML = price;
  document.getElementById("popup-img").src = img;
  document.getElementById("popup-desc").innerHTML = desc;

  // 🔥 Instagram DM redirect instead of WhatsApp
  let username = "daydream_beads_";  // <<< Your Insta Username
  let message = `Hello, I want to order ${name} for ${price}`;
  
  document.getElementById("insta-link").href =
  `https://www.instagram.com/direct/t/${username}?text=${encodeURIComponent(message)}`;

  document.getElementById("popup-box").style.display="block";
  document.getElementById("overlay").style.display="block";
}

function closePopup(){
  document.getElementById("popup-box").style.display="none";
  document.getElementById("overlay").style.display="none";
}
document.getElementById("overlay").onclick = closePopup;