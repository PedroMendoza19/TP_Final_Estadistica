const API_URL_GET =
  "http://127.0.0.1:80/TP_FINAL_ESTADISTICA/api/get_sales.php";

const API_URL_ADD = "http://127.0.0.1:80/TP_FINAL_ESTADISTICA/api/post_sale.php";
const API_URL_PAYMENT_METHOD = "http://127.0.0.1:80/TP_FINAL_ESTADISTICA/api/get_payment_methods.php";
const API_URL_PRODUCTS = "http://127.0.0.1:80/TP_FINAL_ESTADISTICA/api/get_products.php";
const API_URL_ADD_CLIENT = "http://127.0.0.1:80/TP_FINAL_ESTADISTICA/api/post_client.php";
const API_URL_ZONES = "http://127.0.0.1:80/TP_FINAL_ESTADISTICA/api/get_zones.php";
const API_URL_CLIENTS = "http://127.0.0.1:80/TP_FINAL_ESTADISTICA/api/get_clients.php";


let allSales = [];
let barChart, doughnutChart;
let selectsLoaded = false;
let productsData = [];
let zonesData = [];
document.addEventListener("DOMContentLoaded", () => {
  loadSales();
  loadPayMethodSelect();

  const filterSelect = document.getElementById('filterPayment');
  filterSelect.addEventListener("change", filterSalesByPayment)
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
    .then((response) => {
      if (!response.ok) throw new Error("Error en la respuesta del servidor");
      return response.json();
    })
    .then((data) => {
      const paymentSelect = document.getElementById("filterPayment");

      for (let i = 0; i < data.data.length; i++) {
        const newOption = document.createElement("option");
        newOption.value = data.data[i].payment_name;
        newOption.text = data.data[i].payment_name;
        paymentSelect.appendChild(newOption);
      }

    }).catch((error) => {
      console.error("Error al cargar paymentSelect")
    })
}

function filterSalesByPayment() {
  const filterSelect = document.getElementById('filterPayment')
  const selectedPayment = filterSelect.value;

  const tableRow = document.querySelectorAll('table tbody tr');

  tableRow.forEach(row => {
    const paymentCell = row.querySelector("td:nth-child(7)");
    const paymentValue = paymentCell.textContent.trim();

    if (selectedPayment === "" || paymentValue === selectedPayment) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  })

}

function loadModalSelects() {
  if (selectsLoaded) return;

  fetch(API_URL_PAYMENT_METHOD)
    .then((response) => {
      if (!response.ok) throw new Error("Error en la respuesta del servidor");
      return response.json();
    })
    .then((data) => {
      const paymentSelect = document.getElementById("paymentSelect");

      for (let i = 0; i < data.data.length; i++) {
        const newOption = document.createElement("option");
        newOption.value = data.data[i].payment_id;
        newOption.text = data.data[i].payment_name;
        paymentSelect.appendChild(newOption);
      }
    }).catch((error) => {
      console.error("Error al cargar paymentSelect",error)
    })

  fetch(API_URL_PRODUCTS)
    .then((response) => {
      if (!response.ok) throw new Error("Error en la respuesta del servidor");
      return response.json();
    })
    .then((data) => {
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
    .catch((error) => {
      console.error("Error al cargar productSelect", error)
    })

  fetch(API_URL_ZONES)
    .then((response) => {
      if (!response.ok) throw new Error("Error en la respuesta del servidor");
      return response.json();
    })
    .then((data) => {
      let zones = data.data;

      const zonesSelect = document.getElementById('zoneSelect');

      zones.forEach((zone) => {
        const newOption = document.createElement("option");
        newOption.value = zone.zone_id;
        newOption.text = zone.zone_name;
        zonesSelect.appendChild(newOption);
        zonesData[zone.zone_id] = zone;
      });

    }).catch((error) => {
      console.error("Error al cargar zoneSelect", error)
    })

  $(document).ready(function(){
    $('#clientSelect').select2({
      placeholder: "Seleccione un cliente",
      allowClear: true,
      width: '100%',
      theme: 'bootstrap-5'
    });
  });

    fetch(API_URL_CLIENTS)
    .then((response)=>{
      if (!response.ok) throw new Error("Error en la respuesta del servidor");
      return response.json();
    })
    .then((data)=>{
      let clients = data.data;
      const clientsSelect = document.getElementById('clientSelect');
      
      clients.forEach((client)=>{
        const newOption = document.createElement('option');
        newOption.value = client.client_id;
        newOption.text = client.first_name + ' ' + client.last_name;
        newOption.setAttribute('data-firstname',client.first_name);
        newOption.setAttribute('data-lastname',client.last_name);
        clientsSelect.appendChild(newOption);
        
      })
      
      $('#clientSelect').select2({
        placeholder: "Seleccione un cliente",
        allowClear: true,
        width: '100%',
        theme: 'bootstrap-5',
        dropdownParent: $('#addModal'),
        tags: true,
        createTag: function(params){
          var term = $.trim(params.term);
          if ( term === '') return null;
          return{
            id: 'new_' + term,
            text: term + ' (Nuevo Cliente)',
            newTag: true
          }
        }
      });      

      $('#clientSelect').on('select2:select', function (e) {
        var data = e.params.data;

        if(data.id.toString().startsWith('new_')){
          mostrarFormularioNuevoCliente(data.text.replace(' (Nuevo Cliente)', ''))
        }else{
          ocultarFormularioNuevoCliente();
        }
      });

      $('#clientSelect').on('select2:clear', function(e){
        ocultarFormularioNuevoCliente();
      })

    })
    .catch((error)=>{
      console.error("Error al cargar clientsSelect" ,error);
    })

  selectsLoaded = true;
}

function mostrarFormularioNuevoCliente(nombreCompleto){
  const names = nombreCompleto.split(' ');
  const firstName =  names[0] || '';
  const lastName = names.slice(1).join(' ') || '';

  $('#newClientContainer').slideDown();

  $('#newClientName').val(firstName);
  $('#newClientLastName').val(lastName);
}

function ocultarFormularioNuevoCliente(){
  $('#newClientContainer').slideUp();
  $('#newClientName').val('');
  $('#newClientLastName').val('');
  $('#newClientEmail').val('');
  $('#newClientAge').val('');
  $('#zoneSelect').val('');
}

function updateUnitPrice() {
  const productSelect = document.getElementById('productSelect');
  const selectedOption = productSelect.options[productSelect.selectedIndex];
  const unitPriceInput = document.getElementById('unitPriceInput');

  if (selectedOption.value) {
    const price = parseFloat(selectedOption.dataset.price);
    unitPriceInput.value = `$${price.toFixed(2)}`;
  } else {
    unitPriceInput.value = '';
  }

  calcularTotal();
}

function calcularTotal() {
  const productSelect = document.getElementById('productSelect');
  const selectedOption = productSelect.options[productSelect.selectedIndex];
  const quantity = parseFloat(document.getElementById('quantityInput').value) || 0;
  const totalPreview = document.getElementById('totalPreview');

  if (selectedOption.value && quantity > 0) {
    const unitPrice = parseFloat(selectedOption.dataset.price);
    const total = unitPrice * quantity;
    totalPreview.textContent = `$${total.toFixed(2)}`;

  } else {
    totalPreview.textContent = "$0.00"
  }
}

function addClient() {
  const first_name = document.getElementById('firstName').value;
  const last_name = document.getElementById('lastName').value;
  const email = document.getElementById('email').value;
  const age = document.getElementById('age').value;
  const zoneSelect = document.getElementById('zoneSelect').value;
  let zoneSelectedid;
  if (!first_name || !last_name || !email || !age || !zoneSelect) {
    alert('Porfavor completa los campos');
    return;
  }

  zonesData.forEach((zone) => {
    if (zone.zone_id == zoneSelect) {
      zoneSelectedid = zone.zone_id;
    }
  });

  const data = {
    first_name: first_name,
    last_name: last_name,
    email: email,
    age: age,
    zone_id: zoneSelectedid
  }

  fetch(API_URL_ADD_CLIENT, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json; "
    }
  })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 409) {
          alert('El email ya está registrado. Por favor, utiliza otro email.');
          return;
        }
      }
      return response.json().then((data) => {
        console.log("Cliente agregada exitosamente: ", data);

        const modal = bootstrap.Modal.getInstance(document.getElementById('addClientModal'));
        modal.hide();

        document.getElementById('firstName').value = "";
        document.getElementById('lastName').value = "";
        document.getElementById('email').value = "";
        document.getElementById('age').value = "";
        document.getElementById('zoneSelect').value = "";

        alert('Cliente registrado/a correctamente!!');
      })
        .catch((error) => {
          console.error("Error al agregar un cliente", error)
        })
    })

}

  
function addSale() {
  const clienteSeleccionado = $('#clientSelect').val();
  
  if (clienteSeleccionado && clienteSeleccionado.startsWith('new_')) {
    addNewClientAndSale();
  } else {
    procesarVenta(clienteSeleccionado);
  }
}

function addNewClientAndSale() {
  const first_name = document.getElementById('newClientName').value;
  const last_name = document.getElementById('newClientLastName').value;
  const email = document.getElementById('newClientEmail').value;
  const age = document.getElementById('newClientAge').value;
  const zoneSelect = document.getElementById('zoneSelect').value;

  if (!first_name || !last_name || !email || !age || !zoneSelect) {
    alert('Por favor completa todos los campos del cliente');
    return;
  }

  let zoneSelectedid;
  zonesData.forEach((zone) => {
    if (zone.zone_id == zoneSelect) {
      zoneSelectedid = zone.zone_id;
    }
  });

  const data = {
    first_name: first_name,
    last_name: last_name,
    email: email,
    age: age,
    zone_id: zoneSelectedid
  };

  fetch(API_URL_ADD_CLIENT, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then((response) => {
    if (!response.ok) {
      if (response.status === 409) {
        alert('El email ya está registrado. Por favor, utiliza otro email.');
        throw new Error('Email duplicado');
      }
      throw new Error('Error al crear cliente');
    }
    return response.json();
  })
  .then((clienteCreado) => {
    console.log("Cliente agregado exitosamente: ", clienteCreado);
    
    procesarVenta(clienteCreado.id);
    
    ocultarFormularioNuevoCliente();
  })
  .catch((error) => {
    console.error("Error al agregar cliente:", error);
  });
}

function procesarVenta(clienteId) {
  
  const clientId = document.getElementById('clientSelect').value;;
  const productSelect = document.getElementById('productSelect');
  const selectedProduct = productSelect.options[productSelect.selectedIndex];
  const quantity = document.getElementById('quantityInput').value;
  const paymentMethod = document.getElementById('paymentSelect').value;
  if (!clientId || !productSelect.value || !quantity || !paymentMethod) {
    alert('Porfavor completa todos los campos')
    return;
  }
  
  const data = {
    client_id: clientId,
    product_id: productSelect.value,
    productName: selectedProduct.dataset.name,
    sale_quantity: parseInt(quantity),
    unit_price: parseFloat(selectedProduct.dataset.price),
    payment_id: paymentMethod,
  };
  console.log(data);
  
  fetch(API_URL_ADD, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 400) {
          alert('Stock insuficiente para la cantidad solicitada.');
          return;
        }
      } else {
        return response.json().then(() => {

          loadSales();

          const modal = bootstrap.Modal.getInstance(document.getElementById('addModal'));
          modal.hide();

          document.getElementById('clientSelect').value = "";
          document.getElementById('productSelect').value = "";
          document.getElementById('quantityInput').value = "1";
          document.getElementById('paymentSelect').value = "";
          document.getElementById('unitPriceInput').value = "";
          document.getElementById('totalPreview').textContent = "$0.00";

          alert('Venta registrada correctamente!!');
        })
          .catch((error) => {
            console.error("Error al agregar un producto", error)
          });
      }
    })
  
  
  console.log('Procesando venta para cliente:', clienteId);
}
 
document.addEventListener("DOMContentLoaded", () => {
  const productSelect = document.getElementById('productSelect');
  const quantityInput = document.getElementById('quantityInput');

  productSelect.addEventListener('change', updateUnitPrice);

  quantityInput.addEventListener('input', calcularTotal);

  const addModal = document.getElementById('addModal');
  if (addModal) addModal.addEventListener('show.bs.modal', loadModalSelects);
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
          <td><span class="badge badge-payment bg-info">${sale.payment_name
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

function switchTab(tabId, button) {
    document.querySelectorAll('.tab-content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.google-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(tabId).classList.add('active');
    
    button.classList.add('active');
}