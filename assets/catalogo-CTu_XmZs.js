import{t as e}from"./supabase-config-GgnMh8qz.js";var t=[],n=[],r=``;document.addEventListener(`DOMContentLoaded`,async()=>{await Promise.all([i(),a()]),o(),s(),setTimeout(l,100)});async function i(){let{data:n}=await e.from(`categories`).select(`*`).order(`sort_order`,{ascending:!0});t=n||[]}async function a(){let{data:t}=await e.from(`products`).select(`
      *,
      categories(name, slug),
      product_colors(*),
      product_images(*)
    `).eq(`is_active`,!0).order(`sort_order`,{ascending:!0});n=t||[]}function o(){let e=document.getElementById(`category-filters`);e&&(e.innerHTML=`<button class="cat-filter active flex-shrink-0 whitespace-nowrap bg-leather-700 text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg transition-all hover:bg-leather-900" data-cat="">Todos</button>`+t.map(e=>`<button class="cat-filter flex-shrink-0 whitespace-nowrap bg-white text-leather-700 border border-leather-200 px-5 py-2 rounded-full text-sm font-medium transition-all hover:border-leather-700" data-cat="${e.id}">${c(e.name)}</button>`).join(``),e.querySelectorAll(`.cat-filter`).forEach(t=>{t.addEventListener(`click`,()=>{e.querySelectorAll(`.cat-filter`).forEach(e=>{e.className=`cat-filter flex-shrink-0 whitespace-nowrap bg-white text-leather-700 border border-leather-200 px-5 py-2 rounded-full text-sm font-medium transition-all hover:border-leather-700`}),t.className=`cat-filter active flex-shrink-0 whitespace-nowrap bg-leather-700 text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg transition-all hover:bg-leather-900`,r=t.dataset.cat,s()})}))}function s(){let e=document.getElementById(`products-grid`);if(!e)return;let t=n;if(r&&(t=n.filter(e=>e.category_id===r)),t.length===0){e.innerHTML=`
      <div class="col-span-full text-center py-20">
        <i class="fa-solid fa-box-open text-5xl text-leather-300 mb-4"></i>
        <p class="text-gray-500 text-lg">No hay productos en esta categoría aún</p>
      </div>
    `;return}e.innerHTML=t.map((e,t)=>{let n=(e.product_images||[]).sort((e,t)=>e.is_primary?-1:t.is_primary?1:e.sort_order-t.sort_order),r=n[0],i=r?r.image_url:`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23f3f4f6" width="400" height="300"/><text fill="%239ca3af" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="16">Sin imagen</text></svg>`,a=e.categories?.name||``,o=e.product_colors||[],s=t%3*100;return`
      <a href="${`producto.html?id=${e.id}`}" class="product-card reveal block" style="transition-delay: ${s}ms;">
        <!-- Image Container -->
        <div class="product-image-container relative">
          <img src="${i}" alt="${c(e.name)}" class="product-image" loading="lazy">
          ${n.length>1?`
            <div class="absolute bottom-3 right-3 bg-white/90 text-leather-900 text-xs px-2 py-1 rounded-full font-medium">
              <i class="fa-solid fa-images mr-1"></i>${n.length} fotos
            </div>
          `:``}
          <div class="absolute top-4 right-4 bg-leather-700 text-white text-xs px-3 py-1 rounded-full uppercase tracking-tighter font-bold">
            ${c(a)}
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <!-- Content -->
        <div class="p-8">
          <h3 class="text-2xl font-serif font-bold text-leather-950 mb-3">${c(e.name)}</h3>
          <p class="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">${c(e.description||``)}</p>

          ${o.length>0?`
            <div class="mb-5">
              <div class="flex flex-wrap gap-2">
                ${o.map(e=>`
                  <div class="w-7 h-7 rounded-full border-2 border-gray-200 shadow-sm" style="background:${e.hex_value}"></div>
                `).join(``)}
              </div>
            </div>
          `:``}

          <div class="flex items-center gap-2 text-leather-700 font-bold text-sm pt-2 border-t border-gray-100">
            <span>Ver detalles</span>
            <i class="fa-solid fa-arrow-right text-xs"></i>
          </div>
        </div>
      </a>
    `}).join(``),setTimeout(l,50)}function c(e){if(!e)return``;let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function l(){let e=document.querySelectorAll(`.reveal`);for(let t=0;t<e.length;t++){let n=window.innerHeight;e[t].getBoundingClientRect().top<n-100&&e[t].classList.add(`active`)}}window.addEventListener(`scroll`,l);