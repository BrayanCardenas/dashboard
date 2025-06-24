function toggleMenu() {
  const menu = document.getElementById("navbarLinks");
  menu.classList.toggle("active");
}

function actualizarDashboard({ ingresos, gastos, deudas, balance }) {
  document.getElementById('ingresos').textContent = `$${ingresos.toFixed(2)}`;
  document.getElementById('gastos').textContent = `$${gastos.toFixed(2)}`;
  document.getElementById('deudas').textContent = `$${deudas.toFixed(2)}`;
  document.getElementById('balance').textContent = `$${balance.toFixed(2)}`;

  const balanceCard = document.getElementById('balance-card');
  if (balance >= 0) {
    balanceCard.classList.add('positive');
    balanceCard.classList.remove('negative');
  } else {
    balanceCard.classList.add('negative');
    balanceCard.classList.remove('positive');
  }
}

function mostrarMensaje(tipo, mensaje) {
  const contenedor = document.getElementById('flash-messages');
  const div = document.createElement('div');
  div.classList.add('flash-message', tipo === 'error' ? 'error' : 'success');
  div.innerHTML = `
    <span>${mensaje}</span>
    <button class="close-btn" onclick="this.parentElement.remove()">×</button>
  `;
  contenedor.appendChild(div);
  setTimeout(() => {
    div.remove();
  }, 5000);
}

let transacciones = [
  {
    id: 1,
    description: "Sueldo mensual",
    amount: 2500,
    category: "income",
    subcategory: "Salario",
    date: "2025-06-01"
  },
  {
    id: 2,
    description: "Pago de arriendo",
    amount: 800,
    category: "expense",
    subcategory: "Vivienda",
    date: "2025-06-03"
  },
  {
    id: 3,
    description: "Pago tarjeta crédito",
    amount: 400,
    category: "debt",
    subcategory: "Créditos",
    date: "2025-06-05"
  }
];

function renderHistorial() {
  const contenedor = document.getElementById("contenedor-historial");
  const spanCantidad = document.getElementById("cantidad-transacciones");

  contenedor.innerHTML = "";
  if (transacciones.length === 0) {
    contenedor.innerHTML = `
      <div class="text-center">
        <i class="fas fa-inbox fa-3x text-muted"></i>
        <h4>No hay transacciones registradas</h4>
        <p class="text-muted">Comience agregando su primera transacción financiera.</p>
        <a href="#registro" class="btn-submit"><i class="fas fa-plus-circle"></i> Agregar Transacción</a>
      </div>
    `;
    spanCantidad.textContent = "0 transacciones recientes";
    return;
  }

  spanCantidad.textContent = `${transacciones.length} transacciones recientes`;

  let lista = document.createElement("ol");
  lista.classList.add("lista-transacciones");

  let resumen = {
    income: {},
    expense: {},
    debt: {},
    totalIncome: 0,
    totalExpenses: 0
  };

  transacciones.forEach((t) => {
    // Crear ítem de lista
    const li = document.createElement("li");
    li.classList.add("item-transaccion");

    const info = document.createElement("div");
    info.classList.add("info");

    info.innerHTML = `
      <div class="titulo">${t.description}</div>
      <small>${formatearFecha(t.date)} 
        <span class="badge-categoria">${t.subcategory}</span>
      </small>
    `;

    const derecha = document.createElement("div");
    derecha.classList.add("text-end");

    const monto = document.createElement("div");
    monto.textContent = `$${t.amount.toFixed(2)}`;
    monto.classList.add("monto", t.category);

    const btn = document.createElement("button");
    btn.textContent = "Eliminar";
    btn.classList.add("btn-eliminar");
    btn.onclick = () => eliminarTransaccion(t.id);

    derecha.appendChild(monto);
    derecha.appendChild(btn);

    li.appendChild(info);
    li.appendChild(derecha);
    lista.appendChild(li);

    // Acumular resumen
    if (!resumen[t.category][t.subcategory]) {
      resumen[t.category][t.subcategory] = 0;
    }
    resumen[t.category][t.subcategory] += t.amount;
    if (t.category === "income") resumen.totalIncome += t.amount;
    if (t.category === "expense") resumen.totalExpenses += t.amount;
  });

  contenedor.appendChild(lista);
  contenedor.appendChild(renderResumen(resumen));
}

function renderResumen(resumen) {
  const div = document.createElement("div");
  div.classList.add("card-resumen");

  div.innerHTML = `
    <h5>Resumen por Categorías:</h5>
    <div class="row-resumen">
      <div>
        <h6 style="color:green;">💰 Ingresos</h6>
        <ul>
          ${Object.entries(resumen.income)
      .map(([cat, val]) => `<li>${cat}: $${val.toFixed(2)}</li>`)
      .join("")}
        </ul>
      </div>
      <div>
        <h6 style="color:red;">💳 Gastos</h6>
        <ul>
          ${Object.entries(resumen.expense)
      .map(([cat, val]) => `<li>${cat}: $${val.toFixed(2)}</li>`)
      .join("")}
        </ul>
      </div>
      <div>
        <h6 style="color:#ffc107;">📊 Estadísticas</h6>
        <ul>
          <li>⬆️ Total Ingresos: $${resumen.totalIncome.toFixed(2)}</li>
          <li>⬇️ Total Gastos: $${resumen.totalExpenses.toFixed(2)}</li>
          <li>⚖️ Balance: $${(resumen.totalIncome - resumen.totalExpenses).toFixed(2)}</li>
        </ul>
      </div>
    </div>
  `;

  return div;
}

function eliminarTransaccion(id) {
  if (!confirm("¿Está seguro de eliminar esta transacción?")) return;
  transacciones = transacciones.filter((t) => t.id !== id);
  renderHistorial();
}

function formatearFecha(fecha) {
  const d = new Date(fecha);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

function inicializarGraficos() {
  // Pie Chart - Gastos por Categoría
  new Chart(document.getElementById('expensesChart'), {
    type: 'pie',
    data: {
      labels: ['Alimentación', 'Transporte', 'Servicios', 'Otros'],
      datasets: [{
        data: [300, 200, 150, 100],
        backgroundColor: ['#f87171', '#fbbf24', '#34d399', '#60a5fa'],
      }]
    },
    options: {
      responsive: true
    }
  });

  // Bar Chart - Tendencia mensual
  new Chart(document.getElementById('monthlyChart'), {
    type: 'bar',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [{
        label: 'Gastos',
        data: [500, 450, 400, 600, 550, 580],
        backgroundColor: '#60a5fa'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Line Chart - Ingresos vs Gastos
  new Chart(document.getElementById('comparisonChart'), {
    type: 'line',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Ingresos',
          data: [1000, 950, 1050, 1000, 980, 1100],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          tension: 0.3
        },
        {
          label: 'Gastos',
          data: [500, 450, 400, 600, 550, 580],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function onFormSubmit(e) {
  e.preventDefault();

  const descripcion = document.getElementById('description').value.trim();
  const monto = parseFloat(document.getElementById('amount').value);
  const tipo = document.getElementById('category').value;

  if (!descripcion || isNaN(monto) || monto <= 0 || !tipo) {
    mostrarMensaje('error', 'Por favor complete todos los campos obligatorios correctamente.');
    return;
  }

  // Aquí puedes enviar los datos con fetch() si lo necesitas
  mostrarMensaje('success', 'Transacción guardada con éxito.');

  // Resetear formulario (opcional)
  e.target.reset();
}

// Inicialización centralizada
document.addEventListener('DOMContentLoaded', () => {
  // Dashboard inicial
  const datos = {
    ingresos: 2500.75,
    gastos: 1350.50,
    deudas: 600.00,
    balance: 550.25
  };
  actualizarDashboard(datos);

  // Mensajes de ejemplo
  mostrarMensaje('success', '¡Operación realizada correctamente!');
  mostrarMensaje('error', 'Ocurrió un error al guardar los datos.');

  // Historial
  renderHistorial();

  // Gráficos
  inicializarGraficos();

  // Formulario
  const form = document.getElementById('form-registro');
  if (form) {
    form.addEventListener('submit', onFormSubmit);
  }
});

