const BASE_URL = "https://rickandmortyapi.com/api/character";
const state = { page: 1, name: "", status: "", gender: "", totalPages: 0, favorites: [] };

const $cards = document.getElementById("characters-container");
const $loading = document.getElementById("loading");

// Cargar favoritos de LocalStorage
state.favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Filtros
document.getElementById("name-filter").addEventListener("input", e => { state.name = e.target.value; state.page = 1; fetchAndRender(); });
document.getElementById("status-filter").addEventListener("change", e => { state.status = e.target.value; state.page = 1; fetchAndRender(); });
document.getElementById("gender-filter").addEventListener("change", e => { state.gender = e.target.value; state.page = 1; fetchAndRender(); });

// Botones de paginación
document.getElementById("prev-button").addEventListener("click", () => { if (state.page > 1) { state.page--; fetchAndRender(); } });
document.getElementById("next-button").addEventListener("click", () => { if (state.page < state.totalPages) { state.page++; fetchAndRender(); } });

// Ver favoritos
document.getElementById("show-favorites").addEventListener("click", showFavorites);

async function fetchAndRender() {
  $loading.style.display = "block";
  $cards.innerHTML = "";
  try {
    const url = buildUrl();
    const res = await fetch(url);
    if (!res.ok) throw new Error("No encontrado");
    const data = await res.json();
    state.totalPages = data.info.pages;
    renderCards(data.results);
  } catch (err) {
    $cards.innerHTML = "<p class='text-center text-red-400'>No se encontraron resultados.</p>";
  } finally {
    $loading.style.display = "none";
  }
}

function buildUrl() {
  const params = new URLSearchParams();
  params.append("page", state.page);
  if (state.name) params.append("name", state.name);
  if (state.status) params.append("status", state.status);
  if (state.gender) params.append("gender", state.gender);
  return `${BASE_URL}?${params.toString()}`;
}

function renderCards(characters) {
  $cards.innerHTML = "";
  characters.forEach(c => {
    const card = document.createElement("div");
    const isFav = state.favorites.some(f => f.id === c.id);
    card.className = "card bg-gray-800 shadow-lg cursor-pointer";
    card.innerHTML = `
      <img src="${c.image}" alt="${c.name}" class="w-full h-56 object-cover">
      <div class="p-2 flex justify-between items-center">
        <h3 class="text-lg font-bold">${c.name}</h3>
        <button class="btn-fav ${isFav ? 'active' : ''}" title="Favorito">★</button>
      </div>
      <p class="text-sm px-2 pb-2">Estado: ${c.status} | ${c.species}</p>
    `;
    const favBtn = card.querySelector(".btn-fav");
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(c);
      favBtn.classList.toggle("active");
    });
    $cards.appendChild(card);
  });
}

function toggleFavorite(character) {
  const index = state.favorites.findIndex(f => f.id === character.id);
  if (index >= 0) {
    state.favorites.splice(index, 1);
  } else {
    state.favorites.push(character);
  }
  localStorage.setItem("favorites", JSON.stringify(state.favorites));
}

function showFavorites() {
  if (state.favorites.length === 0) {
    $cards.innerHTML = "<p class='text-center text-yellow-300'>No hay favoritos guardados.</p>";
    return;
  }
  renderCards(state.favorites);
}

fetchAndRender();
