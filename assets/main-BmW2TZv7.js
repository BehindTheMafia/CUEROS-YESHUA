import{t as e}from"./supabase-config-GgnMh8qz.js";async function t(){let t=document.getElementById(`featured-products`);if(!t)return;let{data:r}=await e.from(`products`).select(`
      *,
      categories(name),
      product_images(*)
    `).eq(`is_active`,!0).order(`created_at`,{ascending:!1}).limit(3);!r||r.length===0||(t.innerHTML=r.map(e=>{let t=e.product_images?.find(e=>e.is_primary)||e.product_images?.[0],r=t?t.image_url:`assets/cuero-nacional.png`,i=e.categories?.name||``;return`
      <a href="producto.html?id=${e.id}"
        class="bg-white rounded-xl overflow-hidden shadow-lg group product-card-hover cursor-pointer reveal active">
        <div class="h-64 overflow-hidden relative">
          <img src="${r}" alt="${n(e.name)}"
            class="w-full h-full object-cover transition-transform duration-700 product-img" loading="lazy">
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <span class="text-white font-medium">Ver detalles <i class="fa-solid fa-arrow-right ml-2"></i></span>
          </div>
          <span class="absolute top-4 right-4 bg-leather-700 text-white text-xs px-3 py-1 rounded-full uppercase tracking-tighter font-bold">${n(i)}</span>
        </div>
        <div class="p-8 border-t-4 border-transparent group-hover:border-leather-500 transition-colors duration-300">
          <h3 class="text-xl font-serif font-bold text-leather-950 mb-2">${n(e.name)}</h3>
          <p class="text-gray-600 text-sm">${n(e.description||``)}</p>
        </div>
      </a>
    `}).join(``)+`
    <div class="bg-leather-900 rounded-xl overflow-hidden shadow-lg flex flex-col items-center justify-center p-8 text-center border border-leather-700 reveal active">
      <i class="fa-brands fa-whatsapp text-5xl text-leather-300 mb-6"></i>
      <h3 class="text-2xl font-serif font-bold text-white mb-4">¿Busca algo específico?</h3>
      <p class="text-leather-100 mb-8 text-sm">Contamos con un inventario en constante actualización. Consúltenos directamente.</p>
      <a href="https://wa.me/50584449281" target="_blank"
        class="bg-leather-500 hover:bg-leather-300 hover:text-leather-950 text-white font-bold px-8 py-3 rounded-md transition-all duration-300 w-full">
        Cotizar por WhatsApp
      </a>
    </div>
  `)}function n(e){if(!e)return``;let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}document.addEventListener(`DOMContentLoaded`,t);