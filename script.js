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
  
// Variables globales
let categoriasOriginales = [];

// Inicialización al cargar la página
document.addEventListener("DOMContentLoaded", function() {
    // Cargar categorías si estamos en la pestaña correspondiente
    setupTabs();
    
    // Configurar el buscador
    const buscador = document.getElementById('buscador-categorias');
    buscador.addEventListener('input', function() {
        buscarCategorias(this.value.toLowerCase());
    });
});

// Configurar el sistema de pestañas
function setupTabs() {
    // Tabs superiores
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            showTab(tab.dataset.tab);
            if (tab.dataset.tab === 'categorias' && categoriasOriginales.length === 0) {
                cargarCategorias();
            }
        });
    });

    // Menú inferior
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            showTab(item.dataset.tab);
            if (item.dataset.tab === 'categorias' && categoriasOriginales.length === 0) {
                cargarCategorias();
            }
        });
    });
}

// Mostrar la pestaña seleccionada
function showTab(tabId) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Desactivar todas las tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Desactivar todos los items del menú
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Mostrar contenido seleccionado
    document.getElementById(tabId).classList.add('active');
    
    // Activar tab correspondiente
    document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
    
    // Activar item de menú si existe
    const menuItem = document.querySelector(`.menu-item[data-tab="${tabId}"]`);
    if (menuItem) menuItem.classList.add('active');
}

// Cargar categorías desde la API
async function cargarCategorias() {
    const categoriasLista = document.getElementById("categorias-lista");
    categoriasLista.innerHTML = '<p class="loading">Cargando categorías...</p>';
    
    try {
        const response = await fetch('https://opentdb.com/api_category.php');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.trivia_categories || data.trivia_categories.length === 0) {
            throw new Error("No hay categorías disponibles");
        }
        
        categoriasOriginales = data.trivia_categories;
        mostrarCategorias(categoriasOriginales);
        
    } catch (error) {
        console.error("Error al cargar categorías:", error);
        mostrarErrorCarga();
    }
}

// Mostrar categorías en el DOM
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

// Filtrar categorías por nombre
function buscarCategorias(termino) {
    if (!categoriasOriginales.length) return;
    
    const categoriasFiltradas = categoriasOriginales.filter(categoria => 
        categoria.name.toLowerCase().includes(termino)
    );
    
    mostrarCategorias(categoriasFiltradas);
}

// Mostrar mensaje de error
function mostrarErrorCarga() {
    const categoriasLista = document.getElementById("categorias-lista");
    categoriasLista.innerHTML = `
        <div class="error-container">
            <p class="error-message">Error al cargar categorías</p>
            <button onclick="cargarCategorias()" class="retry-button">
                <span>🔄</span> Reintentar
            </button>
        </div>
    `;
}

// Obtener preguntas de una categoría (mantener tu función existente)
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


