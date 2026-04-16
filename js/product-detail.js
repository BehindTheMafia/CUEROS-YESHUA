import { supabase } from './supabase-config.js';

const WHATSAPP_NUMBER = '50584449281';

let currentImageIndex = 0;
let images = [];

// ─── Lightbox state ───
let lbIndex = 0;

// ─── Magnifier state ───
const ZOOM_FACTOR = 1.0; // how much to magnify

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) { showNotFound(); return; }

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(name, slug),
      product_colors(*),
      product_images(*)
    `)
    .eq('id', productId)
    .single();

  if (error || !product) { showNotFound(); return; }

  renderProduct(product);
  loadRelatedProducts(product.category_id, product.id);
  initLightbox();
  initMagnifier();
});

// ─────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────
function renderProduct(product) {
  document.title = `${product.name} | Cuero's Yeshua`;
  document.getElementById('breadcrumb-name').textContent = product.name;

  // Sort images: primary first
  images = (product.product_images || []).sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return (a.sort_order ?? 99) - (b.sort_order ?? 99);
  });

  // Main image
  const mainImg = document.getElementById('main-image');
  if (images.length > 0) {
    mainImg.src = images[0].image_url;
    mainImg.alt = product.name;
  }

  // Click on main image → lightbox
  document.getElementById('main-image-wrapper').addEventListener('click', (e) => {
    // Don't open if clicking nav arrows
    if (e.target.closest('button')) return;
    openLightbox(currentImageIndex);
  });

  // Thumbnails
  const thumbContainer = document.getElementById('thumbnails');
  if (images.length > 1) {
    thumbContainer.innerHTML = images.map((img, i) => `
      <button class="thumb-btn ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Imagen ${i + 1}">
        <img src="${img.image_url}" alt="${esc(product.name)}" class="w-full h-full object-cover" loading="lazy">
      </button>
    `).join('');

    thumbContainer.querySelectorAll('.thumb-btn').forEach(btn => {
      btn.addEventListener('click', () => setCurrentImage(parseInt(btn.dataset.index)));
    });

    // Nav arrows
    const prevBtn = document.getElementById('img-prev');
    const nextBtn = document.getElementById('img-next');
    prevBtn.classList.remove('hidden');
    nextBtn.classList.remove('hidden');
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); setCurrentImage((currentImageIndex - 1 + images.length) % images.length); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); setCurrentImage((currentImageIndex + 1) % images.length); });
  }

  // Category badge
  document.getElementById('product-category-text').textContent = product.categories?.name || 'Sin categoría';

  // Name & description
  document.getElementById('product-title').textContent = product.name;
  document.getElementById('product-description').textContent = product.description || '';

  // Colors
  const colors = product.product_colors || [];
  if (colors.length > 0) {
    document.getElementById('colors-section').classList.remove('hidden');
    document.getElementById('product-colors').innerHTML = colors.map(c => `
      <div class="w-10 h-10 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform cursor-default ring-1 ring-gray-200"
        style="background:${c.hex_value}" title="${esc(c.hex_value)}"></div>
    `).join('');
  }

  // WhatsApp button
  const msg = encodeURIComponent(`Hola, solicito información sobre "${product.name}"`);
  document.getElementById('whatsapp-btn').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;

  // Show content, hide skeleton
  document.getElementById('product-skeleton').classList.add('hidden');
  document.getElementById('product-content').classList.remove('hidden');
}

function setCurrentImage(index) {
  currentImageIndex = index;
  const mainImg = document.getElementById('main-image');
  mainImg.style.opacity = '0';
  setTimeout(() => {
    mainImg.src = images[index].image_url;
    mainImg.style.opacity = '1';
    // Update magnifier source when image changes
    updateMagnifierSource(images[index].image_url);
  }, 150);

  // Update active thumb
  document.querySelectorAll('.thumb-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });
}

// ─────────────────────────────────────────────
// MAGNIFIER LENS
// ─────────────────────────────────────────────
function initMagnifier() {
  const wrapper = document.getElementById('main-image-wrapper');
  const lens = document.getElementById('zoom-lens');
  const hint = document.getElementById('zoom-hint');
  if (!wrapper || !lens) return;

  let currentSrc = '';

  function moveLens(e) {
    const mainImg = document.getElementById('main-image');
    if (!mainImg.src || mainImg.src === window.location.href) return;

    const rect = wrapper.getBoundingClientRect();
    // Pointer position relative to image wrapper
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Clamp to wrapper bounds
    const cx = Math.max(0, Math.min(x, rect.width));
    const cy = Math.max(0, Math.min(y, rect.height));

    // Position the lens circle centred on cursor
    lens.style.left = cx + 'px';
    lens.style.top  = cy + 'px';

    // How many times larger is the magnified image vs wrapper
    const bgW = rect.width  * ZOOM_FACTOR;
    const bgH = rect.height * ZOOM_FACTOR;
    lens.style.backgroundSize = `${bgW}px ${bgH}px`;

    // Offset so the lens shows what's under the cursor
    const lensR = lens.offsetWidth / 2;
    const bgX = -(cx * ZOOM_FACTOR - lensR);
    const bgY = -(cy * ZOOM_FACTOR - lensR);
    lens.style.backgroundPosition = `${bgX}px ${bgY}px`;

    // Update URL if image changed
    if (mainImg.src !== currentSrc) {
      currentSrc = mainImg.src;
      lens.style.backgroundImage = `url('${currentSrc}')`;
    }
  }

  window.updateMagnifierSource = function(url) {
    currentSrc = url;
    lens.style.backgroundImage = `url('${url}')`;
  };

  wrapper.addEventListener('mousemove', (e) => {
    moveLens(e);
    if (hint) hint.style.opacity = '0';
  });
  wrapper.addEventListener('mouseleave', () => {
    if (hint) hint.style.opacity = '1';
  });
}

// ─────────────────────────────────────────────
// LIGHTBOX
// ─────────────────────────────────────────────
function initLightbox() {
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbClose = document.getElementById('lb-close');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');
  const lbCounter = document.getElementById('lb-counter');

  function updateLightbox() {
    lbImg.src = images[lbIndex].image_url;
    if (images.length > 1) {
      lbCounter.textContent = `${lbIndex + 1} / ${images.length}`;
      lbCounter.classList.remove('hidden');
      lbPrev.classList.remove('hidden');
      lbNext.classList.remove('hidden');
    }
  }

  window.openLightbox = function(startIndex = 0) {
    if (images.length === 0) return;
    lbIndex = startIndex;
    updateLightbox();
    lb.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  function closeLightbox() {
    lb.classList.add('hidden');
    document.body.style.overflow = '';
  }

  lbClose.addEventListener('click', closeLightbox);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

  lbPrev.addEventListener('click', () => {
    lbIndex = (lbIndex - 1 + images.length) % images.length;
    updateLightbox();
  });
  lbNext.addEventListener('click', () => {
    lbIndex = (lbIndex + 1) % images.length;
    updateLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lb.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') { lbIndex = (lbIndex - 1 + images.length) % images.length; updateLightbox(); }
    if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % images.length; updateLightbox(); }
  });

  // Touch swipe support
  let touchStartX = 0;
  lbImg.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lbImg.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) { lbIndex = (lbIndex + 1) % images.length; }
      else        { lbIndex = (lbIndex - 1 + images.length) % images.length; }
      updateLightbox();
    }
  }, { passive: true });
}

// ─────────────────────────────────────────────
// RELATED PRODUCTS
// ─────────────────────────────────────────────
async function loadRelatedProducts(categoryId, currentProductId) {
  const { data: related } = await supabase
    .from('products')
    .select(`*, categories(name), product_images(*)`)
    .eq('is_active', true)
    .eq('category_id', categoryId)
    .neq('id', currentProductId)
    .order('sort_order', { ascending: true })
    .limit(3);

  if (!related || related.length === 0) return;

  document.getElementById('related-products').innerHTML = related.map(prod => {
    const primaryImg = prod.product_images?.find(i => i.is_primary) || prod.product_images?.[0];
    const imgSrc = primaryImg?.image_url || '';
    const catName = prod.categories?.name || '';
    return `
      <a href="producto.html?id=${prod.id}"
        class="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border border-leather-100 group">
        <div class="h-52 overflow-hidden relative">
          ${imgSrc ? `<img src="${imgSrc}" alt="${esc(prod.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy">` : ''}
          <div class="absolute top-3 right-3 bg-leather-700 text-white text-xs px-3 py-1 rounded-full uppercase tracking-tight font-bold">${esc(catName)}</div>
        </div>
        <div class="p-5">
          <h3 class="text-lg font-serif font-bold text-leather-950 mb-1 group-hover:text-leather-700 transition-colors">${esc(prod.name)}</h3>
          <p class="text-gray-500 text-sm line-clamp-2">${esc(prod.description || '')}</p>
          <span class="inline-flex items-center gap-1 text-leather-700 font-medium text-sm mt-3">
            Ver detalles <i class="fa-solid fa-arrow-right text-xs"></i>
          </span>
        </div>
      </a>
    `;
  }).join('');

  document.getElementById('related-section').classList.remove('hidden');
}

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────
function showNotFound() {
  document.getElementById('product-skeleton').classList.add('hidden');
  document.getElementById('product-not-found').classList.remove('hidden');
}

function esc(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
