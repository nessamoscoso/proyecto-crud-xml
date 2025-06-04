const form = document.getElementById('form');
const lista = document.getElementById('lista');
const xmlOutput = document.getElementById('xml-output');

form.onsubmit = async e => {
  e.preventDefault();
  const nuevo = {
    nombre: form.nombre.value,
    precio: parseFloat(form.precio.value),
    stock: parseInt(form.stock.value),
    categoria: form.categoria.value,
    destacado: form.destacado.checked
  };
  await fetch('/api/productos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevo)
  });
  form.reset();
  cargar();
};

async function cargar() {
  lista.innerHTML = '';
  const res = await fetch('/api/productos');
  const datos = await res.json();
  datos.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${p.nombre}</strong> - $${p.precio} - Stock: ${p.stock} - Categoría: ${p.categoria} ${p.destacado ? '🌟' : ''}
      </div>
      <span class="acciones">
        <button onclick="ver(${p.id})">Ver</button>
        <button onclick="editar(${p.id})">Modificar</button>
        <button onclick="eliminar(${p.id})">Eliminar</button>
      </span>
    `;
    lista.appendChild(li);
  });
}

async function eliminar(id) {
  await fetch(`/api/productos/${id}`, { method: 'DELETE' });
  cargar();
}

async function ver(id) {
  const res = await fetch('/api/productos');
  const datos = await res.json();
  const producto = datos.find(p => p.id === id);
  alert(`Nombre: ${producto.nombre}
Precio: $${producto.precio}
Stock: ${producto.stock}
Categoría: ${producto.categoria}
Destacado: ${producto.destacado ? 'Sí' : 'No'}`);
}

async function editar(id) {
  const res = await fetch('/api/productos');
  const datos = await res.json();
  const producto = datos.find(p => p.id === id);

  const nuevoNombre = prompt("Nuevo nombre:", producto.nombre);
  const nuevoPrecio = prompt("Nuevo precio:", producto.precio);
  const nuevoStock = prompt("Nuevo stock:", producto.stock);
  const nuevaCategoria = prompt("Nueva categoría:", producto.categoria);
  const esDestacado = confirm("¿Es destacado?");

  if (nuevoNombre && nuevoPrecio && nuevoStock && nuevaCategoria) {
    await fetch(`/api/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nuevoNombre,
        precio: parseFloat(nuevoPrecio),
        stock: parseInt(nuevoStock),
        categoria: nuevaCategoria,
        destacado: esDestacado
      })
    });
    cargar();
  }
}

cargar();

function generarInforme() {
  fetch('/api/informe')
    .then(res => res.text())
    .then(data => {
      xmlOutput.textContent = data;
    });
}

