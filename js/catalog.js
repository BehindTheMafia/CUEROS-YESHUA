import { supabase } from './supabase-config.js';
import { imgAt, srcSet, initImageTransforms } from './supabase-image.js';

// ==================== STATE ====================
let categories = [];
let products = [];
let activeCategory = '';
let searchQuery = '';

// WhatsApp number
const WHATSAPP_NUMBER = '50583900900';

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([loadCategories(), loadProducts()]);

  // Probe if Supabase image transforms are available (Pro plan)
  const sampleImg = products.find(p => p.product_images?.length)?.product_images?.[0]?.image_url;
  if (sampleImg) await initImageTransforms(sampleImg);

  renderSidebar();
  renderMobileCategories();
  initSearch();
  renderProducts();

  // Trigger reveal animation
  setTimeout(reveal, 100);
});

// ==================== DATA ====================
async function loadCategories() {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  categories = data || [];
}

async function loadProducts() {
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      categories(name, slug),
      product_colors(*),
      product_images(*)
    `)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  products = data || [];
  updateSectionsDatalist();
}

function updateSectionsDatalist() {
  const datalist = document.getElementById('sections-list');
  if (!datalist) return;
  
  const uniqueSections = [...new Set(products
    .map(p => p.section_title)
    .filter(t => t && t.trim() !== '')
  )].sort();
  
  datalist.innerHTML = uniqueSections.map(s => `<option value="${s}">`).join('');
}

// ==================== SEARCH ====================
function initSearch() {
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');
  if (!input || !clearBtn) return;

  input.addEventListener('input', () => {
    searchQuery = input.value;
    const hasVal = searchQuery.trim().length > 0;
    clearBtn.style.opacity = hasVal ? '1' : '0';
    clearBtn.style.pointerEvents = hasVal ? 'auto' : 'none';
    renderProducts();
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    searchQuery = '';
    clearBtn.style.opacity = '0';
    clearBtn.style.pointerEvents = 'none';
    input.focus();
    renderProducts();
  });
}

// Case + accent insensitive normalization
function normalize(str) {
  if (!str) return '';
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ==================== SIDEBAR (Desktop) ====================
function renderSidebar() {
  const nav = document.getElementById('sidebar-filters');
  if (!nav) return;

  // Count products per category
  const totalCount = products.length;
  const countMap = {};
  products.forEach(p => {
    if (p.category_id) countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
  });

  let html = '<div class="space-y-0.5">';
  html += makeSidebarBtn('', 'Todos', activeCategory === '', totalCount);
  categories.forEach(c => {
    html += makeSidebarBtn(c.id, c.name, activeCategory === c.id, countMap[c.id] || 0);
  });
  html += '</div>';
  nav.innerHTML = html;

  nav.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', () => selectCategory(btn.dataset.cat));
  });
}

function makeSidebarBtn(catId, label, isActive, count) {
  return `<button class="sidebar-btn ${isActive ? 'active' : ''}" data-cat="${catId}">
    <span style="display:flex;align-items:center;gap:8px;min-width:0">
      <span class="s-dot"></span>
      <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(label)}</span>
    </span>
    <span class="s-count">${count}</span>
  </button>`;
}

// ==================== MOBILE CATEGORIES ====================
function renderMobileCategories() {
  const container = document.getElementById('mobile-category-filters');
  if (!container) return;

  let html = makeMobileBtn('', 'Todos', activeCategory === '');
  categories.forEach(c => {
    html += makeMobileBtn(c.id, c.name, activeCategory === c.id);
  });
  container.innerHTML = html;

  container.querySelectorAll('.mob-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectCategory(btn.dataset.cat);
      // Close mobile sidebar (function is in the inline script)
      if (typeof closeMobileSidebar === 'function') closeMobileSidebar();
    });
  });
}

function makeMobileBtn(catId, label, isActive) {
  return `<button class="mob-cat-btn ${isActive ? 'active' : ''}" data-cat="${catId}">${esc(label)}</button>`;
}


// ==================== CATEGORY SELECTION ====================
function selectCategory(catId) {
  activeCategory = catId;

  // Sync sidebar active state
  document.querySelectorAll('#sidebar-filters .sidebar-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === activeCategory);
  });

  // Sync mobile active state
  document.querySelectorAll('#mobile-category-filters .mob-cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === activeCategory);
  });

  renderProducts();
}

// ==================== RENDER PRODUCTS ====================
function renderProducts() {
  const container = document.getElementById('products-grid');
  const countEl = document.getElementById('results-count');
  if (!container) return;

  // 1. Filter by category
  let filtered = products;
  if (activeCategory) {
    filtered = products.filter(p => p.category_id === activeCategory);
  }

  // 2. Filter by search (case + accent insensitive)
  const q = normalize(searchQuery.trim());
  if (q) {
    filtered = filtered.filter(p =>
      normalize(p.name).includes(q) ||
      normalize(p.description || '').includes(q)
    );
  }

  // 3. Show/hide results count
  if (countEl) {
    if (q || activeCategory) {
      const n = filtered.length;
      countEl.textContent = n === 1 ? '1 producto encontrado' : `${n} productos encontrados`;
      countEl.style.display = 'block';
    } else {
      countEl.style.display = 'none';
    }
  }

  // 4. Empty state
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-20">
        <i class="fa-solid fa-box-open text-5xl text-leather-300 mb-4"></i>
        <p class="text-gray-500 text-lg">No se encontraron productos</p>
        <p class="text-sm text-gray-400 mt-1">Intenta con otro término o categoría</p>
      </div>
    `;
    return;
  }

  // 5. Sort products
  filtered.sort((a, b) => {
    const aSec = (a.section_title || '').trim();
    const bSec = (b.section_title || '').trim();
    
    if (aSec === '' && bSec === '') return (a.sort_order || 0) - (b.sort_order || 0);
    if (aSec === '') return -1;
    if (bSec === '') return 1;
    if (aSec !== bSec) return aSec.localeCompare(bSec);
    return (a.sort_order || 0) - (b.sort_order || 0);
  });

  // 6. Build HTML
  let html = '';
  let currentSection = null;

  filtered.forEach((prod, idx) => {
    if (prod.section_title && prod.section_title !== currentSection) {
      currentSection = prod.section_title;
      html += `
        <div class="col-span-full pt-12 pb-6">
          <div class="flex items-center gap-4">
            <div class="h-px bg-leather-200 flex-1"></div>
            <h2 class="text-xl md:text-2xl font-serif font-bold text-leather-950 px-6 text-center uppercase tracking-widest bg-leather-50 rounded-full py-1 border border-leather-100 shadow-sm">${esc(currentSection)}</h2>
            <div class="h-px bg-leather-200 flex-1"></div>
          </div>
        </div>
      `;
    } else if (!prod.section_title && currentSection !== null) {
      currentSection = null;
    }

    const images = (prod.product_images || []).sort((a, b) => {
      if (a.is_primary) return -1;
      if (b.is_primary) return 1;
      return a.sort_order - b.sort_order;
    });
    const primaryImg = images[0];
    const rawUrl = primaryImg ? primaryImg.image_url : '';
    const imgSrc = rawUrl ? imgAt(rawUrl, 'thumbnail') : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23f3f4f6" width="400" height="300"/><text fill="%239ca3af" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="16">Sin imagen</text></svg>';
    const imgSrcset = rawUrl ? srcSet(rawUrl, [300, 500, 800], 70) : '';
    const colors = prod.product_colors || [];

    // Highlight search matches
    const dispName = q ? highlight(esc(prod.name), searchQuery) : esc(prod.name);
    const dispDesc = q ? highlight(esc(prod.description || ''), searchQuery) : esc(prod.description || '');

    html += `
      <a href="producto.html?id=${prod.id}" class="product-card reveal block group" style="transition-delay: ${(idx % 3) * 100}ms;">
        <!-- Image Container -->
        <div class="product-image-container relative overflow-hidden">
          <img src="${imgSrc}" ${imgSrcset ? `srcset="${imgSrcset}" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"` : ''} alt="${esc(prod.name)}" class="product-image w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async">
          ${images.length > 1 ? `
            <div class="absolute bottom-3 right-3 bg-white/90 text-leather-900 text-xs px-2 py-1 rounded-full font-medium z-10">
              <i class="fa-solid fa-images mr-1"></i>${images.length} fotos
            </div>
          ` : ''}
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <!-- Content -->
        <div class="p-8">
          <h3 class="text-2xl font-serif font-bold text-leather-950 mb-3 group-hover:text-leather-700 transition-colors">${dispName}</h3>
          <p class="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">${dispDesc}</p>

          ${colors.length > 0 ? `
            <div class="mb-5">
              <div class="flex flex-wrap gap-2">
                ${colors.map(c => `
                  <div class="w-7 h-7 rounded-full border-2 border-gray-100 shadow-sm" style="background:${c.hex_value}" title="${esc(c.color_name)}"></div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div class="flex items-center gap-2 text-leather-700 font-bold text-sm pt-4 border-t border-gray-100">
            <span>Ver detalles</span>
            <i class="fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-1"></i>
          </div>
        </div>
      </a>
    `;
  });

  container.innerHTML = html;

  // Re-trigger reveal for new elements
  setTimeout(reveal, 50);
}

// ==================== HIGHLIGHT ====================
function highlight(escapedHtml, query) {
  if (!query.trim()) return escapedHtml;
  try {
    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escapedHtml.replace(
      new RegExp(`(${safe})`, 'gi'),
      '<mark style="background:rgba(212,184,149,0.5);border-radius:2px;padding:0 2px">$1</mark>'
    );
  } catch { return escapedHtml; }
}

// ==================== UTILITIES ====================
function esc(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function reveal() {
  const reveals = document.querySelectorAll('.reveal');
  for (let i = 0; i < reveals.length; i++) {
    const windowHeight = window.innerHeight;
    const elementTop = reveals[i].getBoundingClientRect().top;
    if (elementTop < windowHeight - 100) {
      reveals[i].classList.add('active');
    }
  }
}

window.addEventListener('scroll', reveal);
