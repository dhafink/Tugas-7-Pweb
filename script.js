let foodsData = [];

// Load makanan
window.onload = function() {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'makanan.json', true);

  xhr.onload = function() {
    if (this.status === 200) {
      foodsData = JSON.parse(this.responseText);
      addOrderItem(); // Tambah satu item pertama otomatis
    }
  };

  xhr.send();
};

document.getElementById('addItemBtn').addEventListener('click', addOrderItem);

// Tambahkan 1 set pilihan makanan
function addOrderItem() {
  const orderItems = document.getElementById('orderItems');

  const div = document.createElement('div');
  div.className = 'orderItem';

  const select = document.createElement('select');
  select.required = true;
  select.innerHTML = `<option value="">-- Pilih Makanan --</option>`;

  foodsData.forEach(food => {
    const option = document.createElement('option');
    option.value = food.nama;
    option.setAttribute('data-harga', food.harga);
    option.textContent = `${food.nama}`;
    select.appendChild(option);
  });

  const inputQty = document.createElement('input');
  inputQty.type = 'number';
  inputQty.placeholder = 'Jumlah';
  inputQty.min = 1;
  inputQty.required = true;

  const priceInfo = document.createElement('p');
  priceInfo.innerHTML = 'Estimasi: Rp0';

  select.addEventListener('change', function() {
    updateItemEstimate(select, inputQty, priceInfo);
    updateTotalEstimate();
  });

  inputQty.addEventListener('input', function() {
    updateItemEstimate(select, inputQty, priceInfo);
    updateTotalEstimate();
  });

  div.appendChild(select);
  div.appendChild(inputQty);
  div.appendChild(priceInfo);

  orderItems.appendChild(div);
}

function updateItemEstimate(select, qtyInput, priceInfo) {
  const selectedOption = select.options[select.selectedIndex];
  const price = selectedOption.getAttribute('data-harga') || 0;
  const qty = qtyInput.value || 0;
  const total = price * qty;
  priceInfo.innerHTML = `Estimasi: Rp${total}`;
}

// Hitung total semua item
function updateTotalEstimate() {
  const orderItems = document.querySelectorAll('.orderItem');
  let grandTotal = 0;

  orderItems.forEach(item => {
    const select = item.querySelector('select');
    const qtyInput = item.querySelector('input');
    const selectedOption = select.options[select.selectedIndex];
    const price = selectedOption.getAttribute('data-harga') || 0;
    const qty = qtyInput.value || 0;

    grandTotal += price * qty;
  });

  if (grandTotal > 0) {
    document.getElementById('totalEstimate').classList.remove('hidden');
    document.getElementById('totalPrice').textContent = `Rp${grandTotal}`;
  } else {
    document.getElementById('totalEstimate').classList.add('hidden');
  }
}

// Fungsi untuk menghasilkan CAPTCHA
function generateCaptcha() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let captcha = '';
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  document.getElementById('captcha-code').textContent = captcha;
  return captcha;
}

// Fungsi untuk memvalidasi CAPTCHA
function validateCaptcha() {
  const userInput = document.getElementById('captcha-input').value.toUpperCase();
  const captchaCode = document.getElementById('captcha-code').textContent;

  if (userInput !== captchaCode) {
    document.getElementById('errorMsg').textContent = 'CAPTCHA tidak valid. Silakan coba lagi.';
    generateCaptcha();
    document.getElementById('captcha-input').value = '';
    return false;
  }
  return true;
}

// Tangani submit semua pesanan
document.getElementById('orderForm').addEventListener('submit', function(e) {
  e.preventDefault();

  if (!validateCaptcha()) {
    return;
  }

  const orderItems = document.querySelectorAll('.orderItem');
  let orders = [];
  let error = false;

  orderItems.forEach(item => {
    const select = item.querySelector('select');
    const qtyInput = item.querySelector('input');

    const foodName = select.value;
    const foodPrice = select.options[select.selectedIndex].getAttribute('data-harga');
    const qty = qtyInput.value;

    if (!foodName || qty <= 0) {
      error = true;
      return;
    }

    orders.push({
      makanan: foodName,
      harga: foodPrice,
      jumlah: qty,
      total: foodPrice * qty
    });
  });

  if (error || orders.length === 0) {
    document.getElementById('errorMsg').textContent = "⚠️ Lengkapi semua pilihan makanan dan jumlah!";
    return;
  }

  let resultHTML = `<h2>Pesanan Anda:</h2><ul>`;
  let finalTotal = 0;

  orders.forEach(order => {
    resultHTML += `<li>${order.makanan} (${order.jumlah} pcs) - Rp${order.total}</li>`;
    finalTotal += parseInt(order.total);
  });

  resultHTML += `</ul><h3>Total Semua: Rp${finalTotal}</h3>`;

  document.getElementById('orderResult').innerHTML = resultHTML;
  document.getElementById('errorMsg').textContent = '';
});

// Tambahkan event listener untuk refresh CAPTCHA
document.getElementById('refresh-captcha').addEventListener('click', generateCaptcha);

// Generate CAPTCHA saat halaman dimuat
document.addEventListener('DOMContentLoaded', generateCaptcha);
