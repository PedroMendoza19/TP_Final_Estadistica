const API_URL_GET =
  "http://127.0.0.1:80/TP_FINAL_ESTADISTICA/api/get_sales.php";

const API_URL_ADD =   "http://127.0.0.1:80/TP_FINAL_ESTADISTICA/api/post_sale.php";
const API_URL_PAYMENT_METHOD = "http://127.0.0.1:80/TP_FINAL_ESTADISTICA/api/get_payment_methods.php";
const API_URL_PRODUCTS = "http://127.0.0.1:80/TP_FINAL_ESTADISTICA/api/get_products.php";
const API_URL_ADD_CLIENT = "http://127.0.0.1:80/TP_FINAL_ESTADISTICA/api/post_client.php";
const API_URL_ZONES = "http://127.0.0.1:80/TP_FINAL_ESTADISTICA/api/get_zones.php";


let allSales = [];
let barChart, doughnutChart;
let selectsLoaded = false;
let productsData = [];
let zones = [];
const paymentMethodsData = {};
document.addEventListener("DOMContentLoaded", () => {
  loadSales();
  loadPayMethodSelect();

  const filterSelect = document.getElementById('filterPayment');
  filterSelect.addEventListener("change",filterSalesByPayment)
});

function loadSales() {
  fetch(API_URL_GET)
    .then((response) => {
      if (!response.ok) throw new Error("Error en la respuesta del servidor");
      return response.json();
    })
    .then((data) => {
      if (data.status === "ok") {
        allSales = data.data;
        displaySales(allSales);
        updateStadistics(allSales);
        updateCharts(allSales);
      }
    })
    .catch((error) => {
      console.error("Error al obtener clientes", error);
      document.getElementById("salesTableBody").innerHTML =
        '<tr><td colspan="8" class="text-center text-danger py-5">' +
        '<i class="fas fa-exclamation-triangle fa-3x mb-3"></i>' +
        "<p>Error al cargar las ventas</p></td></tr>";
    });
}

async function loadPayMethodSelect() {
  await fetch(API_URL_PAYMENT_METHOD)
  .then((response)=>{
    if (!response.ok) throw new Error("Error en la respuesta del servidor");
    return response.json();
  })
  .then((data)=>{
    const paymentSelect = document.getElementById("filterPayment");
    
    for (let i = 0; i < data.data.length; i++) {
      const newOption = document.createElement("option");
      newOption.value = data.data[i].payment_name;
      newOption.text =  data.data[i].payment_name;
      paymentSelect.appendChild(newOption);
      paymentMethodsData[data.data[i].payment_name] = data.data[i];      
    }    
    
  }).catch((error)=>{
    console.error("Error al cargar paymentSelect")
  })
}

function filterSalesByPayment(){
  const filterSelect = document.getElementById('filterPayment')
  const selectedPayment = filterSelect.value;

  const tableRow = document.querySelectorAll('table tbody tr');

  tableRow.forEach(row =>{
    const paymentCell = row.querySelector("td:nth-child(7)");
    const paymentValue = paymentCell.textContent.trim();

    if (selectedPayment === "" || paymentValue === selectedPayment){
      row.style.display = "";
    }else{
      row.style.display = "none";
    }
  })

}

function loadModalSelects() {
  if (selectsLoaded) return; 
  
  fetch(API_URL_PAYMENT_METHOD)
  .then((response)=>{
    if (!response.ok) throw new Error("Error en la respuesta del servidor");
    return response.json();
   })
  .then((data)=>{
     const paymentSelect = document.getElementById("paymentSelect");
  
    for (let i = 0; i < data.data.length; i++) {
      const newOption = document.createElement("option");
      newOption.value = data.data[i].payment_name;
      newOption.text =  data.data[i].payment_name;
      paymentSelect.appendChild(newOption);
    }    
  }).catch((error)=>{
    console.error("Error al cargar paymentSelect")
  })

  fetch(API_URL_PRODUCTS)
  .then((response)=>{
    if (!response.ok)  throw new Error("Error en la respuesta del servidor");
    return response.json();
  })
  .then((data)=>{
    productsData = data.data;
    const productSelect = document.getElementById("productSelect")

    for (let i = 0; i < productsData.length; i++) {
      const newOption = document.createElement("option");
      newOption.value = productsData[i].product_id;
      newOption.text = productsData[i].name;
      newOption.dataset.price = productsData[i].unit_price;
      newOption.dataset.name = productsData[i].name;
      productSelect.appendChild(newOption);
    }
  })
  .catch((error)=>{
    console.error("Error al cargar productSelect", error)
  })

  fetch(API_URL_ZONES)
  .then((response)=> {
    if(!response.ok) throw new Error("Error en la respuesta del servidor");
    return;
  })
  .then((data)=>{
    console.log(data);
    

  }).catch((error)=>{
    console.error("Error al cargar zoneSelect", error)
  })

  selectsLoaded = true;
}

function updateUnitPrice(){
  const productSelect = document.getElementById('productSelect');
  const selectedOption = productSelect.options[productSelect.selectedIndex];
  const unitPriceInput = document.getElementById('unitPriceInput');

  if(selectedOption.value){
    const price = parseFloat(selectedOption.dataset.price);
    unitPriceInput.value = `$${price.toFixed(2)}`;
  }else {
    unitPriceInput.value = '';
  }

  calcularTotal();
}

function calcularTotal(){
  const productSelect = document.getElementById('productSelect');
  const selectedOption = productSelect.options[productSelect.selectedIndex];
  const quantity = parseFloat(document.getElementById('quantityInput').value) || 0;
  const totalPreview = document.getElementById('totalPreview');

  if(selectedOption.value && quantity > 0){
    const unitPrice = parseFloat(selectedOption.dataset.price);
    const total = unitPrice * quantity;
    totalPreview.textContent = `$${total.toFixed(2)}`;

  }else{
    totalPreview.textContent = "$0.00"
  }
}

function addSale(){
  const clientName = document.getElementById('clientName').value;
  const productSelect = document.getElementById('productSelect');
  const selectedProduct = productSelect.options[productSelect.selectedIndex];
  const quantity = document.getElementById('quantityInput').value;
  const paymentMethod = document.getElementById('paymentSelect').value;

  if (!clientName || !productSelect.value || !quantity || !paymentMethod) {
    alert('Porfavor completa todos los campos')
    return;
  }

  const data = {
    client_name: clientName,
    product_id: productSelect.value,
    productName: selectedProduct.dataset.name,
    sale_quantity: parseInt(quantity),
    unit_price: parseFloat(selectedProduct.dataset.price),
    payment_id: paymentMethodsData[paymentMethod].payment_id,
  };
  console.log(data);
  
  fetch(API_URL_ADD, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type" : "application/json"
    }
  })
  .then((response)=>{
    if (!response.ok) throw new Error("Error en la respuesta del servidor");
    return response.json();
  })
  .then((responseData)=>{
    console.log("Venta agregada exitosamente: ",responseData);
    
    loadSales();

    const modal = bootstrap.Modal.getInstance(document.getElementById('addModal'));
    modal.hide();

    document.getElementById('clientName').value = "";
    document.getElementById('productSelect').value = "";
    document.getElementById('quantityInput').value = "1";
    document.getElementById('paymentSelect').value = "";
    document.getElementById('unitPriceInput').value = "";
    document.getElementById('totalPreview').textContent = "$0.00";

    alert('Venta registrada correctamente!!');
  })
  .catch((error)=>{
    console.error("Error al agregar un producto", error)
  })
}

document.addEventListener("DOMContentLoaded", ()=>{
  const productSelect = document.getElementById('productSelect');
  const quantityInput = document.getElementById('quantityInput');

  productSelect.addEventListener('change', updateUnitPrice);

  quantityInput.addEventListener('input', calcularTotal);

  const addModal = document.getElementById('addModal');
  if(addModal) addModal.addEventListener('show.bs.modal',loadModalSelects);
});


function displaySales(sales) {
  const tbody = document.getElementById("salesTableBody");

  if (sales.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="8" class="text-center py-5 text-muted">No hay ventas registradas</td></tr>';
    return;
  }

  tbody.innerHTML = sales
    .map(
      (sale) => `
        <tr>
          <td><strong>#${sale.sale_id}</strong></td>
          <td>${formatDate(sale.sale_date)}</td>
          <td>${sale.first_name} ${sale.last_name}</td>
          <td>${sale.name}</td>
          <td>${sale.quantity}</td>
          <td>$${parseFloat(sale.unit_price).toFixed(2)}</td>
          <td><span class="badge badge-payment bg-info">${
            sale.payment_name
          }</span></td>
          <td class="text-end"><strong>$${parseFloat(
            sale.total
          ).toFixed(2)}</strong></td>
      </tr>
        `
    )
    .join("");
}

function updateStadistics(sales) {
  const totalSales = sales.reduce(
    (sum, sale) => sum + parseFloat(sale.total),
    0
  );
  const avgTicket = sales.length > 0 ? totalSales / sales.length : 0;

  const productCounts = {};
  sales.forEach((sale) => {
    productCounts[sale.name] =
      (productCounts[sale.name] || 0) + parseInt(sale.quantity);
  });

  const topProduct = Object.keys(productCounts).reduce(
    (a, b) => (productCounts[a] > productCounts[b] ? a : b),
    "-"
  );

  document.getElementById("totalSales").textContent = `$${totalSales.toFixed(
    2
  )}`;
  document.getElementById("totalTransacciones").textContent = sales.length;
  document.getElementById("topProduct").textContent = topProduct;
  document.getElementById("avgTicket").textContent = `$${avgTicket.toFixed(2)}`;
}

function updateCharts(sales) {
  // Agrupar por producto
  const productData = {};
  sales.forEach((sale) => {
    productData[sale.name] =
      (productData[sale.name] || 0) + parseFloat(sale.total);
  });

  // Agrupar por método de pago
  const paymentData = {};
  sales.forEach((sale) => {
    paymentData[sale.payment_name] =
      (paymentData[sale.payment_name] || 0) + parseFloat(sale.total);
  });

  // Gráfico de barras
  const ctxBar = document.getElementById("myChart");
  if (barChart) barChart.destroy();
  barChart = new Chart(ctxBar, {
    type: "bar",
    data: {
      labels: Object.keys(productData),
      datasets: [
        {
          label: "Ventas por Producto ($)",
          data: Object.values(productData),
          backgroundColor: "rgba(102, 126, 234, 0.8)",
          borderColor: "rgba(102, 126, 234, 1)",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });

  // Gráfico de dona
  const ctxDoughnut = document.getElementById("doughnut");
  if (doughnutChart) doughnutChart.destroy();
  doughnutChart = new Chart(ctxDoughnut, {
    type: "doughnut",
    data: {
      labels: Object.keys(paymentData),
      datasets: [
        {
          data: Object.values(paymentData),
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(75, 192, 192, 0.8)",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// Búsqueda
document.getElementById("searchInput").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filtered = allSales.filter(
    (sale) =>
      sale.first_name.toLowerCase().includes(searchTerm) ||
      sale.last_name.toLowerCase().includes(searchTerm) ||
      sale.name.toLowerCase().includes(searchTerm)
  );
  displaySales(filtered);
});

// Formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

