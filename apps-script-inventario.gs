/**
 * ============================================================================
 * SUNDAY CLÓSET — AUTOMATIZACIÓN DE INGESTA MASIVA DE INVENTARIO (GEM DE VOZ)
 * Archivo: apps-script-inventario.gs
 * Pestaña destino: 'Inventario Central' (Columnas A a la U)
 * ============================================================================
 */

const SHEET_NAME = 'Inventario Central';

/**
 * Crea un menú personalizado en Google Sheets para pegar un JSON directamente
 * desde la interfaz de la hoja de cálculo si se desea ejecutar manualmente.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('✨ Sunday Clóset')
    .addItem('Pegar lote desde Gem (JSON)', 'mostrarModalPegarJSON')
    .addToUi();
}

/**
 * Muestra un cuadro de diálogo en Google Sheets para pegar el JSON del Gem.
 */
function mostrarModalPegarJSON() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Ingesta Masiva desde Gem de Voz (JSON)',
    'Pega aquí el bloque JSON generado por tu Gem de Gemini:',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    const rawText = response.getResponseText();
    if (!rawText || !rawText.trim()) {
      ui.alert('No se ingresó ningún contenido JSON.');
      return;
    }
    try {
      const resultado = procesarLoteInventario(rawText);
      ui.alert(
        '¡Lote registrado con éxito!',
        'Se insertaron ' + resultado.insertados + ' prendas en "' + SHEET_NAME + '".\n' +
        'SKUs generados: ' + resultado.skus.join(', '),
        ui.ButtonSet.OK
      );
    } catch (err) {
      ui.alert('Error al procesar el JSON: ' + err.message);
    }
  }
}

/**
 * Endpoint Webhook HTTP POST (si se publica como Aplicación Web en Google Apps Script).
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No se recibió cuerpo JSON en la petición POST.');
    }
    const resultado = procesarLoteInventario(e.postData.contents);
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: 'Lote insertado correctamente en Inventario Central',
        count: resultado.insertados,
        skus: resultado.skus,
        rows: resultado.filas
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.message || String(error)
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Normaliza el tipo de prenda y obtiene el prefijo de 3 letras en mayúsculas
 * (sin acentos ni caracteres especiales; rellena con 'X' si tiene menos de 3 letras).
 */
function obtenerPrefijoSKU(tipoPrenda) {
  const limpio = String(tipoPrenda || 'Prenda')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase();
  return limpio.substring(0, 3).padEnd(3, 'X');
}

/**
 * Función principal que recibe el JSON (como string o como objeto),
 * calcula SKUs consecutivos, costos y precios, e inserta las 21 columnas (A-U)
 * en la hoja 'Inventario Central'.
 *
 * Esquema JSON esperado:
 * {
 *   "nombreLote": "string",
 *   "costoTotalLote": number,
 *   "prendas": [
 *     {
 *       "tipoPrenda": "string",
 *       "talla": "XS | S | M | L | XL | Única",
 *       "color": "string",
 *       "marca": "string",
 *       "estilo": "Vintage | Cute | Casual",
 *       "condicion": "Nuevo c/etiqueta | Nuevo s/etiqueta | Con detalle",
 *       "precioCompra": number | null,
 *       "precioVenta": number | null
 *     }
 *   ]
 * }
 */
function procesarLoteInventario(inputJSON) {
  let payload;
  if (typeof inputJSON === 'string') {
    const sinFences = inputJSON
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
    payload = JSON.parse(sinFences);
  } else {
    payload = inputJSON;
  }

  if (!payload || !Array.isArray(payload.prendas) || payload.prendas.length === 0) {
    throw new Error('El JSON debe incluir un arreglo "prendas" con al menos 1 elemento.');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('No se encontró la pestaña "' + SHEET_NAME + '" en el documento.');
  }

  // 1. Leer las filas actuales de 'Inventario Central' para contar SKUs existentes por prefijo
  const lastRow = sheet.getLastRow();
  const conteoPrefijos = {};

  if (lastRow >= 2) {
    const valoresExistentes = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    for (let i = 0; i < valoresExistentes.length; i++) {
      const skuCelda = String(valoresExistentes[i][0] || '').trim().toUpperCase();
      const match = skuCelda.match(/^SUN-([A-Z]{3})-(\d+)$/);
      if (match) {
        const pref = match[1];
        conteoPrefijos[pref] = (conteoPrefijos[pref] || 0) + 1;
      } else {
        const tipoExistente = String(valoresExistentes[i][2] || '').trim();
        if (tipoExistente) {
          const pref = obtenerPrefijoSKU(tipoExistente);
          conteoPrefijos[pref] = (conteoPrefijos[pref] || 0) + 1;
        }
      }
    }
  }

  const nombreLote = payload.nombreLote ? String(payload.nombreLote).trim() : '';
  const costoTotalLote = payload.costoTotalLote !== undefined && payload.costoTotalLote !== null
    ? Number(payload.costoTotalLote)
    : 0;
  const totalPrendas = payload.prendas.length;
  const costoDividido = (costoTotalLote > 0 && totalPrendas > 0)
    ? Number((costoTotalLote / totalPrendas).toFixed(2))
    : 0;

  const tz = ss.getSpreadsheetTimeZone() || 'America/Mexico_City';
  const fechaActual = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  const fechaLote = nombreLote ? fechaActual : '';

  const filasNuevas = [];
  const skusGenerados = [];

  for (let i = 0; i < payload.prendas.length; i++) {
    const p = payload.prendas[i];
    const tipoPrenda = String(p.tipoPrenda || 'Prenda').trim();
    const prefijo = obtenerPrefijoSKU(tipoPrenda);

    const siguienteConsecutivo = (conteoPrefijos[prefijo] || 0) + 1;
    conteoPrefijos[prefijo] = siguienteConsecutivo;

    const numeroFormateado = String(siguienteConsecutivo).padStart(3, '0');
    const sku = 'SUN-' + prefijo + '-' + numeroFormateado;
    skusGenerados.push(sku);

    // 2. Costos y Precios (Columnas J y K)
    const tienePrecioCompra = p.precioCompra !== null && p.precioCompra !== undefined && String(p.precioCompra).trim() !== '' && Number(p.precioCompra) > 0;
    const costoUnidad = tienePrecioCompra ? Number(p.precioCompra) : costoDividido;

    const tienePrecioVenta = p.precioVenta !== null && p.precioVenta !== undefined && String(p.precioVenta).trim() !== '' && Number(p.precioVenta) > 0;
    const precioVenta = tienePrecioVenta
      ? Number(p.precioVenta)
      : Math.round((costoUnidad / 0.3) * 1.2);

    const talla = p.talla && String(p.talla).trim() ? String(p.talla).trim() : 'M';
    const color = p.color && String(p.color).trim() ? String(p.color).trim() : '';
    const marca = p.marca && String(p.marca).trim() ? String(p.marca).trim() : 'PacSun';
    const estilo = p.estilo && String(p.estilo).trim() ? String(p.estilo).trim() : 'Vintage';
    const condicion = p.condicion && String(p.condicion).trim() ? String(p.condicion).trim() : 'Nuevo c/etiqueta';

    // 3. Relleno exacto de las 21 columnas (A-U)
    const fila = [
      sku,                          // Col A (0): SKU generado
      '',                           // Col B (1): Foto (URL) vacío
      tipoPrenda,                   // Col C (2): Tipo de Prenda
      talla,                        // Col D (3): Talla (default "M")
      color,                        // Col E (4): Color Principal
      marca,                        // Col F (5): Marca (default "PacSun")
      estilo,                       // Col G (6): Estilo (default "Vintage")
      condicion,                    // Col H (7): Condición (default "Nuevo c/etiqueta")
      'Disponible',                 // Col I (8): Estado / Proceso
      Number(costoUnidad),          // Col J (9): Precio de Compra
      Number(precioVenta),          // Col K (10): Precio de Venta
      fechaActual,                  // Col L (11): Fecha de Compra (YYYY-MM-DD)
      '',                           // Col M (12): Fecha de Venta
      '',                           // Col N (13): Precio Final de Venta
      '',                           // Col O (14): Canal de Venta
      '',                           // Col P (15): Nombre del Drop
      '',                           // Col Q (16): Fecha Programada Drop
      'FALSO',                      // Col R (17): Visible en Web
      nombreLote,                   // Col S (18): Nombre del Lote
      fechaLote,                    // Col T (19): Fecha del Lote (YYYY-MM-DD)
      Number(costoTotalLote)        // Col U (20): Costo Total del Lote
    ];

    filasNuevas.push(fila);
  }

  // Insertar todas las filas en bloque al final de la hoja
  const startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, filasNuevas.length, 21).setValues(filasNuevas);

  return {
    insertados: filasNuevas.length,
    skus: skusGenerados,
    filas: filasNuevas
  };
}
