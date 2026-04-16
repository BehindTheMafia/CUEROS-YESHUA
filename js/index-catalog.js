import { supabase } from './supabase-config.js';

/**
 * Loads the 3 most recent active products and renders them in the home page products section
 */
async function loadFeaturedProducts() {
  const container = document.getElementById('featured-products');
  if (!container) return;

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      categories(name),
      product_images(*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(3);

  if (!products || products.length === 0) return;

  // Replace the first two static cards (keep the CTA card)
  const cards = products.map(prod => {
    const primaryImg = prod.product_images?.find(i => i.is_primary) || prod.product_images?.[0];
    const imgSrc = primaryImg ? primaryImg.image_url : 'assets/cuero-nacional.png';
    const catName = prod.categories?.name || '';

    return `
      <a href="producto.html?id=${prod.id}"
        class="bg-white rounded-xl overflow-hidden shadow-lg group product-card-hover cursor-pointer reveal active">
        <div class="h-64 overflow-hidden relative">
          <img src="${imgSrc}" alt="${esc(prod.name)}"
            class="w-full h-full object-cover transition-transform duration-700 product-img" loading="lazy">
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <span class="text-white font-medium">Ver detalles <i class="fa-solid fa-arrow-right ml-2"></i></span>
          </div>
          <span class="absolute top-4 right-4 bg-leather-700 text-white text-xs px-3 py-1 rounded-full uppercase tracking-tighter font-bold">${esc(catName)}</span>
        </div>
        <div class="p-8 border-t-4 border-transparent group-hover:border-leather-500 transition-colors duration-300">
          <h3 class="text-xl font-serif font-bold text-leather-950 mb-2">${esc(prod.name)}</h3>
          <p class="text-gray-600 text-sm">${esc(prod.description || '')}</p>
        </div>
      </a>
    `;
  }).join('');

  // Keep CTA card at the end
  const ctaCard = `
    <div class="bg-leather-900 rounded-xl overflow-hidden shadow-lg flex flex-col items-center justify-center p-8 text-center border border-leather-700 reveal active">
      <i class="fa-brands fa-whatsapp text-5xl text-leather-300 mb-6"></i>
      <h3 class="text-2xl font-serif font-bold text-white mb-4">¿Busca algo específico?</h3>
      <p class="text-leather-100 mb-8 text-sm">Contamos con un inventario en constante actualización. Consúltenos directamente.</p>
      <a href="https://wa.me/50584449281" target="_blank"
        class="bg-leather-500 hover:bg-leather-300 hover:text-leather-950 text-white font-bold px-8 py-3 rounded-md transition-all duration-300 w-full">
        Cotizar por WhatsApp
      </a>
    </div>
  `;

  container.innerHTML = cards + ctaCard;
}

function esc(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', loadFeaturedProducts);
