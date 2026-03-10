document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("./data/tools.json");
  const tools = await response.json();

  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");
  const resultsContainer = document.getElementById("tools-grid");

  function renderTools(list) {
    resultsContainer.innerHTML = "";

    list.forEach((tool) => {
      const card = document.createElement("div");

      card.innerHTML = `
<div class="border rounded p-4 bg-white">
<h3 class="font-bold">${tool.name}</h3>
<p>${tool.description}</p>
<a href="/pages/alternatives/${tool.slug}/index.html" class="text-blue-500">View Tool</a>
</div>
`;

      resultsContainer.appendChild(card);
    });
  }

  renderTools(tools);

  function filterTools() {
    const search = searchInput.value.toLowerCase();
    const category = categoryFilter.value;

    const filtered = tools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(search) ||
        tool.description.toLowerCase().includes(search);

      const matchesCategory =
        category === "all" || tool.category === category;

      return matchesSearch && matchesCategory;
    });

    renderTools(filtered);
  }

  searchInput.addEventListener("input", filterTools);
  categoryFilter.addEventListener("change", filterTools);
});
