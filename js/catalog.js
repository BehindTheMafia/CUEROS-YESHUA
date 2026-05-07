import { supabase } from './supabase-config.js';
import { imgAt, srcSet, initImageTransforms } from './supabase-image.js';

// ==================== STATE ====================
let categories = [];
let products = [];
let activeCategory = '';

// WhatsApp number
const WHATSAPP_NUMBER = '50583900900';

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([loadCategories(), loadProducts()]);

  // Probe if Supabase image transforms are available (Pro plan)
  // Must run before render so URLs are correct
  const sampleImg = products.find(p => p.product_images?.length)?.product_images?.[0]?.image_url;
  if (sampleImg) await initImageTransforms(sampleImg);

  renderFilters();
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
  renderProducts();
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

// ==================== RENDER ====================
function renderFilters() {
  const container = document.getElementById('category-filters');
  if (!container) return;

  const allBtn = `<button class="cat-filter active flex-shrink-0 whitespace-nowrap bg-leather-700 text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg transition-all hover:bg-leather-900" data-cat="">Todos</button>`;

  const catBtns = categories.map(c =>
    `<button class="cat-filter flex-shrink-0 whitespace-nowrap bg-white text-leather-700 border border-leather-200 px-5 py-2 rounded-full text-sm font-medium transition-all hover:border-leather-700" data-cat="${c.id}">${esc(c.name)}</button>`
  ).join('');

  container.innerHTML = allBtn + catBtns;

  // Re-attach event listeners
  const filters = container.querySelectorAll('.cat-filter');
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      filters.forEach(b => {
        b.classList.remove('active', 'bg-leather-700', 'text-white', 'shadow-lg');
        b.classList.add('bg-white', 'text-leather-700', 'border-leather-200');
      });
      btn.classList.add('active', 'bg-leather-700', 'text-white', 'shadow-lg');
      btn.classList.remove('bg-white', 'text-leather-700', 'border-leather-200');
      
      // Auto-scroll to center on mobile
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      
      renderProducts();
    });
  });

  // Handle scroll mask gradients and arrows
  const filterContainer = document.getElementById('filters-container');
  if (filterContainer) {
    const updateMask = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      // Show left arrow if we have scrolled right sufficiently
      filterContainer.classList.toggle('can-scroll-left', scrollLeft > 15);
      // Show right arrow if we haven't reached the end yet
      filterContainer.classList.toggle('can-scroll-right', scrollLeft + clientWidth < scrollWidth - 15);
    };
    container.addEventListener('scroll', updateMask);
    updateMask(); // init
    window.addEventListener('resize', updateMask);

    // Add arrow button functionality
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');

    if (btnLeft && btnRight) {
      btnLeft.onclick = (e) => {
        e.stopPropagation();
        container.scrollBy({ left: -250, behavior: 'smooth' });
      };
      btnRight.onclick = (e) => {
        e.stopPropagation();
        container.scrollBy({ left: 250, behavior: 'smooth' });
      };
    }
  }
}

function renderProducts() {
  const container = document.getElementById('products-grid');
  if (!container) return;

  let filtered = products;
  if (activeCategory) {
    filtered = products.filter(p => p.category_id === activeCategory);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-20">
        <i class="fa-solid fa-box-open text-5xl text-leather-300 mb-4"></i>
        <p class="text-gray-500 text-lg">No hay productos en esta categoría aún</p>
      </div>
    `;
    return;
  }

  // Sort products: 
  // 1. Products without section_title go first
  // 2. Then follow alphabetical section groups
  // 3. Finally follow internal sort_order
  filtered.sort((a, b) => {
    const aSec = (a.section_title || '').trim();
    const bSec = (b.section_title || '').trim();
    
    // Both empty? Sort by order
    if (aSec === '' && bSec === '') return (a.sort_order || 0) - (b.sort_order || 0);
    // One empty? Empty goes first
    if (aSec === '') return -1;
    if (bSec === '') return 1;
    
    // Different sections? Sort alphabetically
    if (aSec !== bSec) return aSec.localeCompare(bSec);
    
    // Same section? Sort by order
    return (a.sort_order || 0) - (b.sort_order || 0);
  });

  let html = '';
  let currentSection = null;

  filtered.forEach((prod, idx) => {
    // Insert section header if title exists and is different from previous
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
      // End of section
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
          <h3 class="text-2xl font-serif font-bold text-leather-950 mb-3 group-hover:text-leather-700 transition-colors">${esc(prod.name)}</h3>
          <p class="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">${esc(prod.description || '')}</p>

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
