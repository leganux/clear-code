#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Extensiones permitidas
const validExtensions = ['.js', '.ts', '.html', '.css'];

// Función para eliminar saltos de línea duplicados y dejar solo uno
function cleanFileContent(content) {
  // Reemplazar más de dos saltos de línea consecutivos por uno solo
  let cleanedContent = content.replace(/\n{2,}/g, '\n');

  // Remover todas las líneas que contengan console.log
  cleanedContent = cleanedContent.replace(/console\.log\([^)]*\);?/g, '');

  return cleanedContent;
}

// Función para procesar un archivo individual
function processFile(filePath) {
  const ext = path.extname(filePath);

  if (!validExtensions.includes(ext)) {
    return; // Ignorar archivos con extensiones no válidas
  }

  // Leer el contenido del archivo
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error al leer el archivo: ${err.message}`);
      return;
    }

    // Limpiar el contenido del archivo
    const updatedContent = cleanFileContent(data);

    // Sobrescribir el archivo con el contenido actualizado
    fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
      if (err) {
        console.error(`Error al escribir en el archivo: ${err.message}`);
        return;
      }

      console.log(`Procesado: ${filePath}`);
    });
  });
}

// Función para procesar directorios de forma recursiva
function processDirectory(directory) {
  fs.readdir(directory, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(`Error al leer el directorio: ${err.message}`);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(directory, file.name);

      if (file.isDirectory()) {
        // Excluir "node_modules"
        if (['node_modules','public'].includes(file.name)) {
          return;
        }

        // Procesar subdirectorios recursivamente
        processDirectory(filePath);
      } else if (file.isFile()) {
        // Procesar archivos individuales
        processFile(filePath);
      }
    });
  });
}

// Obtener el directorio desde los argumentos
const directoryPath = process.argv[2];

// Verificar si se proporcionó un directorio
if (!directoryPath) {
  console.error('Por favor, proporciona la ruta del directorio que deseas procesar.');
  process.exit(1);
}

// Verificar si la ruta es un directorio
fs.stat(directoryPath, (err, stats) => {
  if (err) {
    console.error(`Error al acceder a la ruta: ${err.message}`);
    process.exit(1);
  }

  if (!stats.isDirectory()) {
    console.error('La ruta proporcionada no es un directorio.');
    process.exit(1);
  }

  // Procesar el directorio
  processDirectory(directoryPath);
});