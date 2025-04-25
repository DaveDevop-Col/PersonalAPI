document.addEventListener("DOMContentLoaded", async function() {
    // Sistema de tabs
    const tabs = document.querySelectorAll('.tab');
    const menuItems = document.querySelectorAll('.menu-item');
    
    function showTab(tabId) {
        // Ocultar todos los contenidos
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Desactivar todas las tabs
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Desactivar todos los items del menú
        menuItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Mostrar contenido seleccionado
        document.getElementById(tabId).classList.add('active');
        
        // Activar tab correspondiente
        document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
        
        // Activar item de menú si existe
        const menuItem = document.querySelector(`.menu-item[data-tab="${tabId}"]`);
        if (menuItem) menuItem.classList.add('active');
        
        // Scroll al inicio
        window.scrollTo(0, 0);
    }
    
    // Event listeners para tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => showTab(tab.dataset.tab));
    });
    
    // Event listeners para menú inferior
    menuItems.forEach(item => {
        item.addEventListener('click', () => showTab(item.dataset.tab));
    });
    
    // Cargar categorías al mostrar esa pestaña
    document.getElementById('categorias').addEventListener('animationend', cargarCategorias);
    
    // Mostrar inicio por defecto
    showTab('inicio');
});

async function cargarCategorias() {
    const categoriasLista = document.getElementById("categorias-lista");
    if (categoriasLista.innerHTML !== '') return;
    
    try {
        const response = await fetch("https://opentdb.com/api_category.php");
        const data = await response.json();
    
        if (data.trivia_categories?.length > 0) {
            categoriasLista.innerHTML = data.trivia_categories.map(categoria => `
                <div class="categoria" onclick="obtenerPreguntas(${categoria.id})">
                    ${categoria.name}
                </div>
            `).join('');
        } else {
            categoriasLista.innerHTML = '<p class="error">No se pudieron cargar las categorías</p>';
        }
    } catch (error) {
        categoriasLista.innerHTML = '<p class="error">Error de conexión</p>';
        console.error("Error:", error);
    }
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
    // Deshabilitar todas las opciones
    elemento.parentNode.querySelectorAll('.opcion').forEach(opcion => {
        opcion.style.pointerEvents = 'none';
    });
    
    // Marcar respuesta
    if (opcionSeleccionada === respuestaCorrecta) {
        elemento.classList.add('correcta');
    } else {
        elemento.classList.add('incorrecta');
        // Mostrar la correcta
        elemento.parentNode.querySelectorAll('.opcion').forEach(opcion => {
            if (opcion.textContent === respuestaCorrecta) {
                opcion.classList.add('correcta');
            }
        });
    }
}
  
