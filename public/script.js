const form = document.getElementById('form');
const lista = document.getElementById('lista');
const xmlOutput = document.getElementById('xml-output');

form.onsubmit = async e => {
  e.preventDefault();
  const nuevo = {
    nombre: form.nombre.value,
    precio: parseFloat(form.precio.value),
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
    li.textContent = `${p.nombre} - $${p.precio} ${p.destacado ? '🌟' : ''}`;
    li.onclick = async () => {
      await fetch(`/api/productos/${p.id}`, { method: 'DELETE' });
      cargar();
    };
    lista.appendChild(li);
  });
}

async function generarInforme() {
  const res = await fetch('/api/informe');
  const xml = await res.text();
  xmlOutput.textContent = xml;
}

cargar();
