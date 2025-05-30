document.addEventListener("DOMContentLoaded", function() {
    setupTabs();
    showTab('inicio');
});

function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const menuItems = document.querySelectorAll('.menu-item');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            showTab(tab.dataset.tab);
            if (tab.dataset.tab === 'categorias' && categoriasOriginales.length === 0) {
                cargarCategorias();
            }
        });
    });

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            showTab(item.dataset.tab);
            if (item.dataset.tab === 'categorias' && categoriasOriginales.length === 0) {
                cargarCategorias();
            }
        });
    });
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');

    const menuItem = document.querySelector(`.menu-item[data-tab="${tabId}"]`);
    if (menuItem) menuItem.classList.add('active');

    window.scrollTo(0, 0);
}

let categoriasOriginales = [];

async function cargarCategorias() {
    const categoriasLista = document.getElementById("categorias-lista");
    categoriasLista.innerHTML = '<p class="loading">Cargando categorías...</p>';

    try {
        const response = await fetch('https://opentdb.com/api_category.php');
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();

        if (!data.trivia_categories || data.trivia_categories.length === 0)
            throw new Error("No hay categorías disponibles");

        categoriasOriginales = data.trivia_categories;
        mostrarCategorias(categoriasOriginales);

    } catch (error) {
        console.error("Error al cargar categorías:", error);
        mostrarErrorCarga();
    }
}

function mostrarCategorias(categorias) {
    const categoriasLista = document.getElementById("categorias-lista");

    if (categorias.length === 0) {
        categoriasLista.innerHTML = '<p class="no-results">No se encontraron categorías</p>';
        return;
    }

    categoriasLista.innerHTML = categorias.map(categoria => `
        <div class="categoria" onclick="obtenerPreguntas(${categoria.id})">
            ${categoria.name}
        </div>
    `).join('');
}

function mostrarErrorCarga() {
    const categoriasLista = document.getElementById("categorias-lista");
    categoriasLista.innerHTML = `
        <div class="error-container">
            <p class="error-message">Error al cargar categorías</p>
            <button onclick="cargarCategorias()" class="retry-button">🔄 Reintentar</button>
        </div>
    `;
}

async function obtenerPreguntas(categoriaId) {
    const preguntasLista = document.getElementById("preguntas-lista");
    preguntasLista.innerHTML = '<p>Cargando preguntas...</p>';

    try {
        const response = await fetch(`https://opentdb.com/api.php?amount=5&category=${categoriaId}`);
        const data = await response.json();

        if (data.results?.length > 0) {
            preguntasLista.innerHTML = data.results.map((pregunta, index) => {
                const opciones = [...pregunta.incorrect_answers, pregunta.correct_answer]
                    .sort(() => Math.random() - 0.5);

                return `
                    <div class="pregunta">
                        <h2>${index + 1}. ${pregunta.question}</h2>
                        <div class="opciones">
                            ${opciones.map(opcion => `
                                <div class="opcion" onclick="verificarRespuesta(this, '${opcion}', '${pregunta.correct_answer}')">
                                    ${opcion}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            preguntasLista.innerHTML = '<p class="error">No hay preguntas disponibles</p>';
        }
    } catch (error) {
        preguntasLista.innerHTML = '<p class="error">Error al cargar preguntas</p>';
        console.error("Error:", error);
    }
}

function verificarRespuesta(elemento, opcionSeleccionada, respuestaCorrecta) {
    elemento.parentNode.querySelectorAll('.opcion').forEach(opcion => {
        opcion.style.pointerEvents = 'none';
    });

    if (opcionSeleccionada === respuestaCorrecta) {
        elemento.classList.add('correcta');
    } else {
        elemento.classList.add('incorrecta');
        elemento.parentNode.querySelectorAll('.opcion').forEach(opcion => {
            if (opcion.textContent === respuestaCorrecta) {
                opcion.classList.add('correcta');
            }
        });
    }
}
