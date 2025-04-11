document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab, .bottom-nav button");
  const contents = document.querySelectorAll(".tab-content");

  const universityList = document.getElementById("universityList");
  const searchInput = document.getElementById("searchInput");
  const filterSelect = document.getElementById("filterSelect");
  const favoritesList = document.getElementById("favoritesList");
  const form = document.getElementById("registrationForm");

  let universities = [];

  // 🌐 Obtener universidades desde la API
  fetch("https://universities.hipolabs.com/search?country=Colombia")
    .then(res => res.json())
    .then(data => {
      universities = data;
      renderUniversities(universities);
      populateFilter(universities);
    })
    .catch(err => {
      console.error("Error al cargar la API:", err);
      universityList.innerHTML = "<p>Error al cargar universidades.</p>";
    });

  // 📋 Mostrar universidades
  function renderUniversities(data) {
    if (!universityList) return;
    if (data.length === 0) {
      universityList.innerHTML = "<p>No se encontraron resultados.</p>";
      return;
    }

    universityList.innerHTML = data.map(uni => `
      <div class="card">
        <h3>${uni.name}</h3>
        <p><strong>País:</strong> ${uni.country}</p>
        <p><strong>Estado/Provincia:</strong> ${uni["state-province"] || "N/A"}</p>
        <p><strong>Dominio:</strong> ${uni.domains[0]}</p>
        <p><strong>Sitio Web:</strong> <a href="${uni.web_pages[0]}" target="_blank">${uni.web_pages[0]}</a></p>
        <button onclick="addToFavorites('${uni.name}', '${uni.web_pages[0]}')">⭐ Agregar a Favoritos</button>
      </div>
    `).join("");
  }

  // 🔎 Buscador
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();
      const filtered = universities.filter(uni =>
        uni.name.toLowerCase().includes(query)
      );
      renderUniversities(filtered);
    });
  }

  // 🔽 Filtro por dominio
  if (filterSelect) {
    filterSelect.addEventListener("change", () => {
      const value = filterSelect.value;
      const filtered = universities.filter(uni =>
        value ? uni.domains.some(domain => domain.includes(value)) : true
      );
      renderUniversities(filtered);
    });
  }

  // 🧠 Llenar el select de filtro
  function populateFilter(data) {
    const domains = [...new Set(data.flatMap(uni => uni.domains))];
    domains.sort();
    filterSelect.innerHTML = '<option value="">Todos</option>' +
      domains.map(domain => `<option value="${domain}">${domain}</option>`).join("");
  }

  // ⭐ Agregar a favoritos
  window.addToFavorites = function (name, url) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!favorites.find(fav => fav.name === name)) {
      favorites.push({ name, url });
      localStorage.setItem("favorites", JSON.stringify(favorites));
      alert("Agregado a favoritos");
    } else {
      alert("Ya está en favoritos");
    }
  };

  // ❤️ Mostrar favoritos
  function renderFavorites() {
    if (!favoritesList) return;
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.length === 0) {
      favoritesList.innerHTML = "<p>No hay favoritos aún.</p>";
      return;
    }

    favoritesList.innerHTML = favorites.map((fav, index) => `
      <div class="card">
        <h3>${fav.name}</h3>
        <p><a href="${fav.url}" target="_blank">${fav.url}</a></p>
        <button onclick="removeFavorite(${index})">🗑️ Eliminar</button>
      </div>
    `).join("");
  }

  // 🗑️ Eliminar favorito
  window.removeFavorite = function(index) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites.splice(index, 1);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();
  };

  // 📑 Cambiar pestañas
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");

      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(target).classList.add("active");

      if (target === "favorites") {
        renderFavorites();
      }
    });
  });

  // 📝 Formulario de registro
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const values = Object.fromEntries(data.entries());
      alert("¡Registro exitoso!\n" + JSON.stringify(values, null, 2));
      form.reset();
    });
  }

});
