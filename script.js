// Función para validar que los inputs sean números positivos
function validateInput(inputElement) {
    if (inputElement.value < 0) {
        inputElement.value = 0;
    }
}

// Función para agregar una nueva fila a la tabla
function addRow(tableId) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    const newRow = document.createElement('tr');
    const quantityStep = '1';
    newRow.innerHTML = `
        <td><input type="number" value="" min="1" step="${quantityStep}" class="input-field w-full" onchange="validateInput(this)"></td>
        <td><input type="number" value="" step="0.01" min="0.01" class="input-field w-full" onchange="validateInput(this)"></td>
    `;
    tableBody.appendChild(newRow);
}

// Función para leer los datos de una tabla, ignorando filas con valores vacíos o no válidos
function readTableData(tableId) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    const rows = tableBody.querySelectorAll('tr');
    const data = [];
    rows.forEach(row => {
        const quantityInput = row.children[0].querySelector('input');
        const measureInput = row.children[1].querySelector('input');
        const quantity = parseFloat(quantityInput.value);
        const measure = parseFloat(measureInput.value);

        if (!isNaN(quantity) && quantity > 0 && !isNaN(measure) && measure > 0) {
            data.push({ quantity: parseInt(quantity), measure });
        }
    });
    return data;
}

// Función para consolidar las cantidades de medidas idénticas
function consolidateData(data) {
    const consolidatedMap = new Map();

    data.forEach(item => {
        const measureKey = item.measure.toFixed(2);
        if (consolidatedMap.has(measureKey)) {
            consolidatedMap.set(measureKey, consolidatedMap.get(measureKey) + item.quantity);
        } else {
            consolidatedMap.set(measureKey, item.quantity);
        }
    });

    const consolidatedArray = [];
    consolidatedMap.forEach((quantity, measureKey) => {
        consolidatedArray.push({
            quantity: quantity,
            measure: parseFloat(measureKey)
        });
    });
    return consolidatedArray;
}

// Función para ordenar los datos: primero por medida (mayor a menor), luego por cantidad (mayor a menor)
function sortData(data) {
    return [...data].sort((a, b) => {
        if (b.measure !== a.measure) {
            return b.measure - a.measure;
        }
        return b.quantity - a.quantity;
    });
}

// Función para calcular el total de metros
function calculateTotalMeters(data) {
    return data.reduce((total, item) => total + (item.quantity * item.measure), 0);
}

// --- Funciones específicas para Láminas ---
function processLaminas(type) {
    const rawData = readTableData('laminasTable');
    if (rawData.length === 0) {
        document.getElementById('laminasOutput').classList.remove('hidden');
        document.getElementById('laminasResultContent').innerHTML = '<p class="text-red-500">Por favor, agregue al menos una fila con datos válidos.</p>';
        document.getElementById('laminasTotalMeters').textContent = '';
        return;
    }

    const consolidatedData = consolidateData(rawData);
    const sortedData = sortData(consolidatedData);
    const totalMeters = calculateTotalMeters(sortedData);
    let resultContent = '';

    if (type === 'display') {
        resultContent += '<table class="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">';
        resultContent += '<thead><tr><th>Cantidad</th><th>Medida (metros)</th></tr></thead>';
        resultContent += '<tbody>';
        sortedData.forEach(item => {
            resultContent += `<tr><td>${item.quantity}</td><td>${item.measure.toFixed(2)}</td></tr>`;
        });
        resultContent += '</tbody></table>';
    } else if (type === 'sap') {
        resultContent += '<p class="font-mono text-sm break-all">Formato SAP:</p>';
        resultContent += '<div class="bg-gray-100 p-3 rounded-md mt-2">';
        sortedData.forEach(item => {
            resultContent += `<div>${item.quantity}</div>`;
            resultContent += `<div>${item.measure.toFixed(2)}</div>`;
        });
        resultContent += '</div>';
    }

    document.getElementById('laminasOutput').classList.remove('hidden');
    document.getElementById('laminasResultContent').innerHTML = resultContent;
    document.getElementById('laminasTotalMeters').textContent = `Total de Metros: ${totalMeters.toFixed(2)} m`;
}

// --- Funciones específicas para Arquiteja ---
const validArquitejaMeasures = [
    0.66, 1.00, 1.33, 1.66, 2.00, 2.33, 2.66, 3.00, 3.33, 3.66,
    4.00, 4.33, 4.66, 5.00, 5.33, 5.66, 6.00, 6.33, 6.66, 7.00,
    7.33, 7.66, 8.00, 8.33, 8.66, 9.00, 9.33, 9.66, 10.00, 10.33,
    10.66, 11.00, 11.33, 11.66, 12.00
];

function roundArquitejaMeasure(measure) {
    for (let i = 0; i < validArquitejaMeasures.length; i++) {
        if (measure <= validArquitejaMeasures[i]) {
            return validArquitejaMeasures[i];
        }
    }
    return validArquitejaMeasures[validArquitejaMeasures.length - 1];
}

function processArquiteja(type) {
    const rawData = readTableData('arquitejaTable');
    if (rawData.length === 0) {
        document.getElementById('arquitejaOutput').classList.remove('hidden');
        document.getElementById('arquitejaResultContent').innerHTML = '<p class="text-red-500">Por favor, agregue al menos una fila con datos válidos.</p>';
        document.getElementById('arquitejaTotalMeters').textContent = '';
        return;
    }

    const processedData = rawData.map(item => ({
        quantity: item.quantity,
        measure: roundArquitejaMeasure(item.measure)
    }));

    const consolidatedData = consolidateData(processedData);
    const sortedData = sortData(consolidatedData);
    const totalMeters = calculateTotalMeters(sortedData);
    let resultContent = '';

    if (type === 'display') {
        resultContent += '<table class="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">';
        resultContent += '<thead><tr><th>Cantidad</th><th>Medida (metros)</th></tr></thead>';
        resultContent += '<tbody>';
        sortedData.forEach(item => {
            resultContent += `<tr><td>${item.quantity}</td><td>${item.measure.toFixed(2)}</td></tr>`;
        });
        resultContent += '</tbody></table>';
    } else if (type === 'sap') {
        resultContent += '<p class="font-mono text-sm break-all">Formato SAP:</p>';
        resultContent += '<div class="bg-gray-100 p-3 rounded-md mt-2">';
        sortedData.forEach(item => {
            resultContent += `<div>${item.quantity}</div>`;
            resultContent += `<div>${item.measure.toFixed(2)}</div>`;
        });
        resultContent += '</div>';
    }

    document.getElementById('arquitejaOutput').classList.remove('hidden');
    document.getElementById('arquitejaResultContent').innerHTML = resultContent;
    document.getElementById('arquitejaTotalMeters').textContent = `Total de Metros: ${totalMeters.toFixed(2)} m`;
}

// --- Funciones para la nueva sección de Techos Irregulares ---
function calcularLongitudesLaminas(ladoMayor, ladoMenor, cantidadLaminas) {
    const razon = (ladoMayor - ladoMenor) / cantidadLaminas;
    const longitudes = [];
    let longitud = ladoMayor;
    longitudes.push(longitud);
    for (let i = 1; i < cantidadLaminas; i++) {
        longitud -= razon;
        longitudes.push(longitud);
    }
    return longitudes;
}

function calcularLaminasIrregulares() {
    const ladoMayorInput = document.getElementById("ladoMayor");
    const ladoMenorInput = document.getElementById("ladoMenor");
    const cantidadLaminasInput = document.getElementById("cantidadLaminas");
    const listaLongitudes = document.getElementById("listaLongitudes");
    const sapContentDiv = document.getElementById("irregularLaminasSapContent");
    const outputDiv = document.getElementById("irregularLaminasOutput");
    const errorMessageDiv = document.getElementById("irregularLaminasErrorMessage");

    errorMessageDiv.classList.add('hidden');
    listaLongitudes.innerHTML = "";
    sapContentDiv.innerHTML = "";
    outputDiv.classList.add('hidden');

    const ladoMayor = parseFloat(ladoMayorInput.value);
    const ladoMenor = parseFloat(ladoMenorInput.value);
    const cantidadLaminas = parseInt(cantidadLaminasInput.value);

    if (isNaN(ladoMayor) || ladoMayor <= 0 ||
        isNaN(ladoMenor) || ladoMenor <= 0 ||
        isNaN(cantidadLaminas) || cantidadLaminas <= 0) {
        errorMessageDiv.textContent = "Por favor ingresa valores válidos y positivos para los lados mayor y menor, y la cantidad de láminas.";
        errorMessageDiv.classList.remove('hidden');
        outputDiv.classList.remove('hidden');
        return;
    }

    if (ladoMenor >= ladoMayor) {
        errorMessageDiv.textContent = "El lado menor debe ser estrictamente menor que el lado mayor para este cálculo.";
        errorMessageDiv.classList.remove('hidden');
        outputDiv.classList.remove('hidden');
        return;
    }

    const longitudes = calcularLongitudesLaminas(ladoMayor, ladoMenor, cantidadLaminas);

    longitudes.forEach((longitud, index) => {
        const li = document.createElement("li");
        li.textContent = `Lámina ${index + 1}: ${longitud.toFixed(2)} metros`;
        listaLongitudes.appendChild(li);
    });

    let sapHtml = '';
    longitudes.forEach(longitud => {
        sapHtml += `<div>1</div>`;
        sapHtml += `<div>${longitud.toFixed(2)}</div>`;
    });
    sapContentDiv.innerHTML = sapHtml;

    outputDiv.classList.remove('hidden');
}
