import { supabase } from './supabase-config.js';
import { imgAt, srcSet, initImageTransforms } from './supabase-image.js';

// ==================== STATE ====================
let categories = [];
let products = [];
let activeCategory = '';

// WhatsApp number
const WHATSAPP_NUMBER = '50584449281';

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

  // Handle scroll mask gradients for mobile
  const mask = container.closest('.scroll-mask');
  if (mask) {
    const updateMask = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      mask.classList.toggle('scrolled-left', scrollLeft > 10);
      mask.classList.toggle('scrolled-right', scrollLeft + clientWidth >= scrollWidth - 10);
    };
    container.addEventListener('scroll', updateMask);
    updateMask(); // init
    window.addEventListener('resize', updateMask);

    // Add arrow button functionality
    const btnLeft = mask.querySelector('.arrow-left');
    const btnRight = mask.querySelector('.arrow-right');

    if (btnLeft && btnRight) {
      btnLeft.onclick = () => {
        container.scrollBy({ left: -200, behavior: 'smooth' });
      };
      btnRight.onclick = () => {
        container.scrollBy({ left: 200, behavior: 'smooth' });
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

  container.innerHTML = filtered.map((prod, idx) => {
    const images = (prod.product_images || []).sort((a, b) => {
      if (a.is_primary) return -1;
      if (b.is_primary) return 1;
      return a.sort_order - b.sort_order;
    });
    const primaryImg = images[0];
    const rawUrl = primaryImg ? primaryImg.image_url : '';
    const imgSrc = rawUrl ? imgAt(rawUrl, 'thumbnail') : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23f3f4f6" width="400" height="300"/><text fill="%239ca3af" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="16">Sin imagen</text></svg>';
    const imgSrcset = rawUrl ? srcSet(rawUrl, [300, 500, 800], 70) : '';
    const catName = prod.categories?.name || '';
    const colors = prod.product_colors || [];
    const delay = (idx % 3) * 100;

    const detailUrl = `producto.html?id=${prod.id}`;

    return `
      <a href="${detailUrl}" class="product-card reveal block" style="transition-delay: ${delay}ms;">
        <!-- Image Container -->
        <div class="product-image-container relative">
          <img src="${imgSrc}" ${imgSrcset ? `srcset="${imgSrcset}" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"` : ''} alt="${esc(prod.name)}" class="product-image" loading="lazy" decoding="async">
          ${images.length > 1 ? `
            <div class="absolute bottom-3 right-3 bg-white/90 text-leather-900 text-xs px-2 py-1 rounded-full font-medium">
              <i class="fa-solid fa-images mr-1"></i>${images.length} fotos
            </div>
          ` : ''}
          <div class="absolute top-4 right-4 bg-leather-700 text-white text-xs px-3 py-1 rounded-full uppercase tracking-tighter font-bold">
            ${esc(catName)}
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <!-- Content -->
        <div class="p-8">
          <h3 class="text-2xl font-serif font-bold text-leather-950 mb-3">${esc(prod.name)}</h3>
          <p class="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">${esc(prod.description || '')}</p>

          ${colors.length > 0 ? `
            <div class="mb-5">
              <div class="flex flex-wrap gap-2">
                ${colors.map(c => `
                  <div class="w-7 h-7 rounded-full border-2 border-gray-200 shadow-sm" style="background:${c.hex_value}"></div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div class="flex items-center gap-2 text-leather-700 font-bold text-sm pt-2 border-t border-gray-100">
            <span>Ver detalles</span>
            <i class="fa-solid fa-arrow-right text-xs"></i>
          </div>
        </div>
      </a>
    `;
  }).join('');

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
