const express = require('express');
const fs = require('fs-extra');
const cors = require('cors');
const { create } = require('xmlbuilder2');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Rutas de archivos
const dataFile = path.join(__dirname, 'data', 'productos.json');
const xmlFile = path.join(__dirname, 'informes', 'informe.xml');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Asegurar que el archivo JSON exista
(async () => {
  if (!await fs.pathExists(dataFile)) {
    await fs.outputJson(dataFile, []);
  }
})();

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
  const data = await fs.readJSON(dataFile);
  res.json(data);
});

// Agregar un producto
app.post('/api/productos', async (req, res) => {
  const data = await fs.readJSON(dataFile);
  const nuevo = req.body;
  nuevo.id = Date.now(); // Generar ID único
  data.push(nuevo);
  await fs.writeJSON(dataFile, data, { spaces: 2 });
  res.status(201).json(nuevo);
});

// Modificar un producto
app.put('/api/productos/:id', async (req, res) => {
  const data = await fs.readJSON(dataFile);
  const id = parseInt(req.params.id);
  const index = data.findIndex(p => p.id === id);
  if (index !== -1) {
    data[index] = { ...data[index], ...req.body, id };
    await fs.writeJSON(dataFile, data, { spaces: 2 });
    res.json(data[index]);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

// Eliminar un producto
app.delete('/api/productos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  let data = await fs.readJSON(dataFile);
  data = data.filter(p => p.id !== id);
  await fs.writeJSON(dataFile, data, { spaces: 2 });
  res.json({ mensaje: 'Eliminado' });
});

// Generar informe XML
app.get('/api/informe', async (req, res) => {
  const productos = await fs.readJSON(dataFile);
  const total = productos.reduce((sum, p) => sum + p.precio, 0);
  const destacados = productos.filter(p => p.destacado).length;
  const porcentaje = productos.length > 0 ? ((destacados / productos.length) * 100).toFixed(2) : 0;

  const xml = create({ version: '1.0' })
    .ele('informe')
      .ele('resumen')
        .ele('total').txt(total).up()
        .ele('porcentajeDestacados').txt(porcentaje).up()
      .up()
      .ele('productos');

  productos.forEach(p => {
    xml.ele('producto')
      .ele('id').txt(p.id).up()
      .ele('nombre').txt(p.nombre).up()
      .ele('precio').txt(p.precio).up()
      .ele('stock').txt(p.stock).up()
       .ele('categoria').txt(p.categoria).up()
      .ele('destacado').txt(p.destacado).up()
      .up();
  });

  const xmlStr = xml.end({ prettyPrint: true });
  await fs.outputFile(xmlFile, xmlStr);
  res.type('application/xml').send(xmlStr);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
