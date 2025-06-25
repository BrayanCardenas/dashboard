// Menú responsive
function toggleMenu() {
  const menu = document.getElementById("navbarLinks");
  menu.classList.toggle("active");
}

// Actualiza los valores del dashboard principal
function actualizarDashboard({ ingresos, gastos, deudas, balance }) {
  document.getElementById('ingresos').textContent = `$${ingresos.toFixed(2)}`;
  document.getElementById('gastos').textContent = `$${gastos.toFixed(2)}`;
  document.getElementById('deudas').textContent = `$${deudas.toFixed(2)}`;
  document.getElementById('balance').textContent = `$${balance.toFixed(2)}`;

  // Cambia el color del balance según sea positivo o negativo
  const balanceCard = document.getElementById('balance-card');
  if (balance >= 0) {
    balanceCard.classList.add('positive');
    balanceCard.classList.remove('negative');
  } else {
    balanceCard.classList.add('negative');
    balanceCard.classList.remove('positive');
  }

  // Llama al gráfico de barras
  renderGraficoBarras({ ingresos, gastos, deudas });
  renderGraficoPastel({ ingresos, gastos, deudas });
}

// Muestra mensajes de éxito o error en pantalla
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

// Opciones de subcategorías por tipo
const subcategoriasPorTipo = {
  income: [
    "Salario",
    "Ventas",
    "Intereses",
    "Premios",
    "Otros"
  ],
  expense: [
    "Vivienda",
    "Alimentación",
    "Transporte",
    "Servicios",
    "Educación",
    "Salud",
    "Entretenimiento",
    "Otros"
  ],
  debt: [
    "Créditos",
    "Tarjeta de crédito",
    "Préstamos personales",
    "Hipoteca",
    "Otros"
  ]
};

// Actualiza las opciones del select de subcategoría según la categoría elegida
function actualizarSubcategorias() {
  const categoria = document.getElementById('category').value;
  const subcatSelect = document.getElementById('subcategory');
  subcatSelect.innerHTML = '<option value="">Seleccione una categoría</option>';
  if (subcategoriasPorTipo[categoria]) {
    subcategoriasPorTipo[categoria].forEach(subcat => {
      const option = document.createElement('option');
      option.value = subcat;
      option.textContent = subcat;
      subcatSelect.appendChild(option);
    });
  }
}

// Datos de ejemplo para las transacciones
let transacciones = [];

// Renderiza el historial de transacciones en pantalla
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

  // Resumen por categoría
  let resumen = {
    income: {},
    expense: {},
    debt: {},
    totalIncome: 0,
    totalExpenses: 0
  };

  transacciones.forEach((t) => {
    // Crea cada ítem de la lista de transacciones
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

    // Monto de la transacción
    const monto = document.createElement("div");
    monto.textContent = `$${t.amount.toFixed(2)}`;
    monto.classList.add("monto", t.category);

    // Botón para eliminar la transacción
    const btn = document.createElement("button");
    btn.textContent = "Eliminar";
    btn.classList.add("btn-eliminar");
    btn.onclick = () => eliminarTransaccion(t.id);

    derecha.appendChild(monto);
    derecha.appendChild(btn);

    li.appendChild(info);
    li.appendChild(derecha);
    lista.appendChild(li);

    // Acumula datos para el resumen
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

// Renderiza el resumen de ingresos, gastos y balance por categoría 
function renderResumen(resumen) {
  const div = document.createElement("div");
  div.classList.add("card-resumen");

  div.innerHTML = `
    <h5>Resumen por Categorías:</h5>
    <div class="row-resumen">
      <div>
        <h6 class="resume-item" style="color:green;">💰 Ingresos</h6>
        <ul>
          ${Object.entries(resumen.income)
      .map(([cat, val]) => `<li>${cat}: $${val.toFixed(2)}</li>`)
      .join("")}
        </ul>
      </div>
      <div>
        <h6 class="resume-item " style="color:red;">💳 Gastos</h6>
        <ul>
          ${Object.entries(resumen.expense)
      .map(([cat, val]) => `<li>${cat}: $${val.toFixed(2)}</li>`)
      .join("")}
        </ul>
      </div>
      <div>
        <h6 class="resume-item" style="color:#ffc107">📊 Estadísticas</h6>
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

// Elimina una transacción por su ID y actualiza el historial
function eliminarTransaccion(id) {
  if (!confirm("¿Está seguro de eliminar esta transacción?")) return;
  transacciones = transacciones.filter((t) => t.id !== id);
  renderHistorial();

  // Calcula los totales para el dashboard
  const ingresos = transacciones.filter(t => t.category === 'income').reduce((acc, t) => acc + t.amount, 0);
  const gastos = transacciones.filter(t => t.category === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const deudas = transacciones.filter(t => t.category === 'debt').reduce((acc, t) => acc + t.amount, 0);
  const balance = ingresos - gastos - deudas;

  actualizarDashboard({ ingresos, gastos, deudas, balance });
}

// Formatea la fecha a dd/mm/yyyy
function formatearFecha(fecha) {
  const d = new Date(fecha);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

// Maneja el envío del formulario de registro de transacciones
function onFormSubmit(e) {
  e.preventDefault();

  // Obtén los valores del formulario
  const descripcion = document.getElementById('description').value.trim();
  const monto = parseFloat(document.getElementById('amount').value);
  const tipo = document.getElementById('category').value;
  const subcategoria = document.getElementById('subcategory').value;
  const fecha = document.getElementById('transaction_date').value;

  // Validación
  if (!descripcion || isNaN(monto) || monto <= 0 || !tipo || !subcategoria) {
    mostrarMensaje('error', 'Por favor complete todos los campos obligatorios correctamente.');
    return;
  }

  // Agrega la nueva transacción al arreglo
  transacciones.push({
    id: Date.now(),
    description: descripcion,
    amount: monto,
    category: tipo,
    subcategory: subcategoria,
    date: fecha || new Date().toISOString().slice(0, 10)
  });

  mostrarMensaje('success', 'Transacción guardada con éxito.');

  // Actualiza historial y dashboard
  renderHistorial();

  // Calcula los totales para el dashboard
  const ingresos = transacciones.filter(t => t.category === 'income').reduce((acc, t) => acc + t.amount, 0);
  const gastos = transacciones.filter(t => t.category === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const deudas = transacciones.filter(t => t.category === 'debt').reduce((acc, t) => acc + t.amount, 0);
  const balance = ingresos - gastos - deudas;

  actualizarDashboard({ ingresos, gastos, deudas, balance });

  // Resetear formulario y subcategorías
  e.target.reset();
  actualizarSubcategorias();
}

function renderGraficoBarras({ ingresos, gastos, deudas }) {
  const contenedor = document.getElementById('grafico-barras');
  // Encuentra el valor máximo para escalar las barras
  const max = Math.max(ingresos, gastos, deudas, 1);
  if (!contenedor) return;
  contenedor.innerHTML = `
    <div class="barra ingresos" style="height:${(ingresos / max) * 100}%">
      $${ingresos.toFixed(2)}
      <div class="barra-label">Ingresos</div>
    </div>
    <div class="barra gastos" style="height:${(gastos / max) * 100}%">
      $${gastos.toFixed(2)}
      <div class="barra-label">Gastos</div>
    </div>
    <div class="barra deudas" style="height:${(deudas / max) * 100}%">
      $${deudas.toFixed(2)}
      <div class="barra-label">Deudas</div>
    </div>
  `;
}

function renderGraficoPastel({ ingresos, gastos, deudas }) {
  const pastel = document.getElementById('grafico-pastel');
  const total = ingresos + gastos + deudas;

  if (!pastel) return;

  // Si no hay datos, todo gris
  if (total === 0) {
    pastel.style.background = "#bdbdbd";
  } else if (
    (ingresos > 0 && gastos === 0 && deudas === 0) ||
    (gastos > 0 && ingresos === 0 && deudas === 0) ||
    (deudas > 0 && ingresos === 0 && gastos === 0)
  ) {
    // Solo hay un valor, llena todo el círculo con ese color
    let color = "#4caf50";
    if (gastos > 0) color = "#ef4444";
    if (deudas > 0) color = "#ffc107";
    pastel.style.background = color;
  } else {
    // Hay más de un valor, distribuye proporcionalmente
    const ingresosPorc = (ingresos / total) * 100;
    const gastosPorc = (gastos / total) * 100;
    const deudasPorc = (deudas / total) * 100;

    // Ángulos para cada segmento
    const ingresosDeg = ingresosPorc * 3.6;
    const gastosDeg = gastosPorc * 3.6;
    const deudasDeg = deudasPorc * 3.6;

    pastel.style.background = `
  conic-gradient(
    #4caf50 0 ${ingresosDeg}deg,
    #ef4444 ${ingresosDeg}deg ${ingresosDeg + gastosDeg}deg,
    #ffc107 ${ingresosDeg + gastosDeg}deg 360deg
  )
`;

    // Elimina separadores previos
    const oldSep = pastel.querySelector('.grafico-pastel-separador');
    if (oldSep) oldSep.remove();

    // Crea separadores radiales
    const sepDiv = document.createElement('div');
    sepDiv.className = 'grafico-pastel-separador';

    // Calcula los ángulos de separación
    const angulos = [];
    let currentAngle = 0;

    // Categorías activas con su ángulo
    const activos = [];
    if (ingresos > 0) activos.push({ nombre: 'ingresos', deg: ingresosDeg });
    if (gastos > 0) activos.push({ nombre: 'gastos', deg: gastosDeg });
    if (deudas > 0) activos.push({ nombre: 'deudas', deg: deudasDeg });

    // Calcular ángulos acumulados para cada corte
    for (let i = 0; i < activos.length; i++) {
      currentAngle += activos[i].deg;
      angulos.push(currentAngle);
    }


    // Crea las líneas separadoras
    angulos.forEach(angle => {
      const linea = document.createElement('div');
      linea.className = 'grafico-pastel-separador-linea';
      linea.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
      sepDiv.appendChild(linea);
    });

    pastel.appendChild(sepDiv);
  }

  pastel.innerHTML += `
    <div class="grafico-pastel-label">
      <span style="color:#4caf50">●</span> Ingresos<br>
      <span style="color:#ef4444">●</span> Gastos<br>
      <span style="color:#ffc107">●</span> Deudas
    </div>
  `;
}
// Inicialización centralizada al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-registro');
  if (form) {
    form.addEventListener('submit', function (e) {
      // Si el formulario es inválido, muestra los mensajes y NO ejecuta el guardado
      if (!form.checkValidity()) {
        e.preventDefault();
        form.classList.add('was-validated');
        mostrarMensaje('error', 'Por favor complete todos los campos obligatorios correctamente.');
        return;
      }
      // Si es válido, ejecuta el guardado
      e.preventDefault();
      form.classList.remove('was-validated'); // Limpia validación previa
      onFormSubmit(e);
    });
  }

  const categoriaSelect = document.getElementById('category');
  if (categoriaSelect) {
    categoriaSelect.addEventListener('change', actualizarSubcategorias);
    actualizarSubcategorias();
  }

  // Dashboard inicial
  actualizarDashboard({
    ingresos: 0,
    gastos: 0,
    deudas: 0,
    balance: 0
  });

  // Historial
  renderHistorial();
});



