const API_URL = "http://127.0.0.1:8000";
const API_URL_GET = `${API_URL}/TP_FINAL_ESTADISTICA/api/get_sales.php`;
const API_URL_ADD = `${API_URL}/TP_FINAL_ESTADISTICA/api/post_sale.php`;
const API_URL_PAYMENT_METHOD = `${API_URL}/TP_FINAL_ESTADISTICA/api/get_payment_methods.php`;
const API_URL_PRODUCTS = `${API_URL}/TP_FINAL_ESTADISTICA/api/get_products.php`;
const API_URL_ADD_CLIENT = `${API_URL}/TP_FINAL_ESTADISTICA/api/post_client.php`;
const API_URL_ZONES = `${API_URL}/TP_FINAL_ESTADISTICA/api/get_zones.php`;
const API_URL_CLIENTS = `${API_URL}/TP_FINAL_ESTADISTICA/api/get_clients.php`;
const API_URL_STATISTICS = `${API_URL}/TP_FINAL_ESTADISTICA/api/get_statistics.php`;
const API_URL_CORRELATIONS = `${API_URL}/TP_FINAL_ESTADISTICA/api/get_correlations.php`;
const API_URL_DESVIATION = `${API_URL}/TP_FINAL_ESTADISTICA/api/get_desviation.php`;

let allSales = [];
let barChart, doughnutChart;
let selectsLoaded = false;
let productsData = [];
let zonesData = [];
let averageChart = null;
let correlationChart = null;
let statisticsData = null;

document.addEventListener("DOMContentLoaded", () => {
  loadSales();
  loadPayMethodSelect();
  loadStatistics();
  loadCorrelations();

  const filterSelect = document.getElementById('filterPayment');
  if (filterSelect) filterSelect.addEventListener("change", filterSalesByPayment);
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

function loadStatistics() {
  ("Cargando estadisticas de :", API_URL_STATISTICS);
  fetch(API_URL_STATISTICS)
    .then(response => {
      ('Respuesta recibida, status: ', response.status);

      if (!response.ok) throw new Error("Error en la respuesta del servidor" + response.status);
      response.json().then(data => {
        ('Datos COMPLETOS de estadisticas recibidas: ', JSON.stringify(data, null, 2));
        ('Status: ', data.status);
        ('Data: ', data.data);

        if (data.status === 'ok' && data.data) {
          statisticsData = data.data;

          setupAverageSelector();
          displayAverageChart('day');
        }
      });
    })

    .catch(error => {
      console.error('Error al cargar el grafico', error)
    })
}

function setupAverageSelector() {
  const selector = document.getElementById('averageTypeSelect');
  if (selector) {
    ('Selector encontrado, añadiendo event Listener');
    selector.removeEventListener('change', handleAverageChange)
    selector.addEventListener('change', handleAverageChange);
  } else {
    console.error('No se encontro el selector averageTypeSelector')
  }
}

function handleAverageChange(e) {
  ('Cambio detectado', e.target.value);
  displayAverageChart(e.target.value);
}

function displayAverageChart(type) {
  ('Mostrando graficos de tipo', type);

  if (!statisticsData) {
    console.error('No hay datos de estadisticas disponibles')
    return;
  }

  let data, labels, title;

  switch (type) {
    case 'day':
      data = statisticsData['Average by day'];
      labels = Object.keys(data);
      title = 'Promedio de Ventas por dia';
      break;
    case 'product':
      data = statisticsData['Average by product'];
      labels = Object.keys(data);
      title = 'Promedio de Ventas por productos';
      break;
    case 'client':
      data = statisticsData['Average by client'];
      labels = Object.keys(data);
      title = 'Promedio de Ventas por cliente';
      break;
    default:
      console.error('Tipo de grafico no valido: ', type);
      return;
  }

  if (!data || Object.keys(data).length === 0) {
    console.error('No hay datos para mostrar en el grafico');
    return;
  }

  const values = Object.values(data);
  ('Datos del grafico: ', { labels, values });

  if (averageChart) averageChart.destroy();

  const ctx = document.getElementById('averageChart');
  if (!ctx) {
    console.error('No se encontro averageChart');
    return;
  }

  averageChart = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Promedio ($)',
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 16 }
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return '$' + value.toFixed(2);
            }
          }
        }
      }
    }
  })
}

function loadCorrelations() {
  fetch(API_URL_CORRELATIONS)
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        displayCorrelationChart(data.correlations);
        displayCorrelationInterpretations(data.correlations);
      }
    })
    .catch(error => {
      console.error('Error al cargar correlaciones:', error);
    });
}

function displayCorrelationChart(correlations) {
  const ctx = document.getElementById('correlationChart').getContext('2d');

  if (correlationChart) {
    correlationChart.destroy();
  }

  const labels = [
    'Precio vs Cantidad',
    'Cantidad vs Día',
    'Total vs Método Pago'
  ];

  const values = [
    correlations.price_vs_quantity,
    correlations.quantity_vs_day_of_week,
    correlations.total_vs_payment_method
  ];

  const backgroundColors = values.map(val => {
    if (val > 0.7) return 'rgba(75, 192, 192, 0.6)';
    if (val > 0.3) return 'rgba(54, 162, 235, 0.6)';
    if (val > -0.3) return 'rgba(255, 206, 86, 0.6)';
    if (val > -0.7) return 'rgba(255, 159, 64, 0.6)';
    return 'rgba(255, 99, 132, 0.6)';
  });

  correlationChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Coeficiente de Pearson',
        data: values,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('0.6', '1')),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: true,
          text: 'Coeficientes de Correlación de Pearson',
          font: { size: 16 }
        }
      },
      scales: {
        y: {
          min: -1,
          max: 1,
          ticks: {
            stepSize: 0.2
          }
        }
      }
    }
  });
}

function displayCorrelationInterpretations(correlations) {
  const interpretations = {
    price_vs_quantity: interpretCorrelation(correlations.price_vs_quantity,
      'A mayor precio', 'menor cantidad', 'mayor cantidad'),
    quantity_vs_day_of_week: interpretCorrelation(correlations.quantity_vs_day_of_week,
      'El día de la semana', 'no influye significativamente en', 'influye en'),
    total_vs_payment_method: interpretCorrelation(correlations.total_vs_payment_method,
      'El método de pago', 'no se relaciona con', 'se relaciona con')
  };

  document.getElementById('corrPriceQuantityText').innerHTML =
    `<strong>r = ${correlations.price_vs_quantity.toFixed(3)}</strong><br>${interpretations.price_vs_quantity}`;

  document.getElementById('corrQuantityDayText').innerHTML =
    `<strong>r = ${correlations.quantity_vs_day_of_week.toFixed(3)}</strong><br>${interpretations.quantity_vs_day_of_week}`;

  document.getElementById('corrTotalPaymentText').innerHTML =
    `<strong>r = ${correlations.total_vs_payment_method.toFixed(3)}</strong><br>${interpretations.total_vs_payment_method}`;
}

function interpretCorrelation(value, subject, negText, posText) {
  const absValue = Math.abs(value);
  let strength = '';

  if (absValue > 0.9) strength = 'muy fuerte';
  else if (absValue > 0.7) strength = 'fuerte';
  else if (absValue > 0.5) strength = 'moderada';
  else if (absValue > 0.3) strength = 'débil';
  else return `${subject} ${negText} la otra variable.`;

  const direction = value > 0 ? 'positiva' : 'negativa';
  return `Correlación ${strength} ${direction}. ${subject} ${posText} la otra variable.`;
}

function calculateDeviation() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  (startDate);

  if (!startDate || !endDate) {
    alert('Por favor selecciona ambas fechas');
    return;
  }

  if (startDate === endDate) {
    alert('Las fechas no pueden ser iguales');
    return;
  }

  const data = {
    origin_date: startDate,
    end_date: endDate
  };

  fetch(API_URL_DESVIATION, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        document.getElementById('deviationResult').style.display = 'block';
        document.getElementById('deviationValue').textContent = '$' + data.data.toFixed(2);
        document.getElementById('deviationPeriod').textContent =
          `${startDate} a ${endDate}`;
      } else {
        alert(data.message || 'Error al calcular la desviación');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al calcular la desviación estándar');
    });
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
      console.error("Error al cargar paymentSelect", error)
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

  $(document).ready(function () {
    $('#clientSelect').select2({
      placeholder: "Seleccione un cliente",
      allowClear: true,
      width: '100%',
      theme: 'bootstrap-5'
    });
  });

  fetch(API_URL_CLIENTS)
    .then((response) => {
      if (!response.ok) throw new Error("Error en la respuesta del servidor");
      return response.json();
    })
    .then((data) => {
      let clients = data.data;
      const clientsSelect = document.getElementById('clientSelect');

      clients.forEach((client) => {
        const newOption = document.createElement('option');
        newOption.value = client.client_id;
        newOption.text = client.first_name + ' ' + client.last_name;
        newOption.setAttribute('data-firstname', client.first_name);
        newOption.setAttribute('data-lastname', client.last_name);
        clientsSelect.appendChild(newOption);

      })

      $('#clientSelect').select2({
        placeholder: "Seleccione un cliente",
        allowClear: true,
        width: '100%',
        theme: 'bootstrap-5',
        dropdownParent: $('#addModal'),
        tags: true,
        createTag: function (params) {
          var term = $.trim(params.term);
          if (term === '') return null;
          return {
            id: 'new_' + term,
            text: term + ' (Nuevo Cliente)',
            newTag: true
          }
        }
      });

      $('#clientSelect').on('select2:select', function (e) {
        var data = e.params.data;

        if (data.id.toString().startsWith('new_')) {
          mostrarFormularioNuevoCliente(data.text.replace(' (Nuevo Cliente)', ''))
        } else {
          ocultarFormularioNuevoCliente();
        }
      });

      $('#clientSelect').on('select2:clear', function (e) {
        ocultarFormularioNuevoCliente();
      })

    })
    .catch((error) => {
      console.error("Error al cargar clientsSelect", error);
    })

  selectsLoaded = true;
}

function mostrarFormularioNuevoCliente(nombreCompleto) {
  const names = nombreCompleto.split(' ');
  const firstName = names[0] || '';
  const lastName = names.slice(1).join(' ') || '';

  $('#newClientContainer').slideDown();

  $('#newClientName').val(firstName);
  $('#newClientLastName').val(lastName);
}

function ocultarFormularioNuevoCliente() {
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
      return response.json().then((data) => {
      ("Cliente agregado exitosamente: ", data.data.client_id);      
      procesarVenta(data.data.client_id);

      ocultarFormularioNuevoCliente();
    })
    .catch((error) => {
      console.error("Error al agregar cliente:", error);
    });
    });
    
}

function procesarVenta(clientId) {
  
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
  const productData = {};
  sales.forEach((sale) => {
    productData[sale.name] =
      (productData[sale.name] || 0) + parseFloat(sale.total);
  });

  const paymentData = {};
  sales.forEach((sale) => {
    paymentData[sale.payment_name] =
      (paymentData[sale.payment_name] || 0) + parseFloat(sale.total);
  });

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
