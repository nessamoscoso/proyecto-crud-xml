const express = require('express');
const fs = require('fs-extra');
const cors = require('cors');
const { create } = require('xmlbuilder2');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const dataFile = './data/productos.json';
const xmlFile = './informes/informe.xml';

app.get('/api/productos', async (req, res) => {
  const data = await fs.readJSON(dataFile);
  res.json(data);
});

app.post('/api/productos', async (req, res) => {
  const data = await fs.readJSON(dataFile);
  const nuevo = req.body;
  nuevo.id = Date.now();
  data.push(nuevo);
  await fs.writeJSON(dataFile, data, { spaces: 2 });
  res.json(nuevo);
});

app.put('/api/productos/:id', async (req, res) => {
  const data = await fs.readJSON(dataFile);
  const index = data.findIndex(p => p.id == req.params.id);
  if (index !== -1) {
    data[index] = { ...data[index], ...req.body };
    await fs.writeJSON(dataFile, data, { spaces: 2 });
    res.json(data[index]);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

app.delete('/api/productos/:id', async (req, res) => {
  let data = await fs.readJSON(dataFile);
  data = data.filter(p => p.id != req.params.id);
  await fs.writeJSON(dataFile, data, { spaces: 2 });
  res.json({ mensaje: 'Eliminado' });
});

app.get('/api/informe', async (req, res) => {
  const productos = await fs.readJSON(dataFile);
  const total = productos.reduce((sum, p) => sum + p.precio, 0);
  const destacados = productos.filter(p => p.destacado).length;
  const porcentaje = ((destacados / productos.length) * 100).toFixed(2);

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
      .ele('destacado').txt(p.destacado).up()
      .up();
  });

  const xmlStr = xml.end({ prettyPrint: true });
  await fs.outputFile(xmlFile, xmlStr);
  res.type('application/xml').send(xmlStr);
});

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
