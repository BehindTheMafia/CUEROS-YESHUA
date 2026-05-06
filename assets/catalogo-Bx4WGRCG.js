import{t as e}from"./supabase-config-xTA2IjZq.js";import{n as t,r as n,t as r}from"./supabase-image-Dtm2Wkp6.js";var i=[],a=[],o=``;document.addEventListener(`DOMContentLoaded`,async()=>{await Promise.all([s(),c()]);let e=a.find(e=>e.product_images?.length)?.product_images?.[0]?.image_url;e&&await t(e),l(),u(),setTimeout(f,100)});async function s(){let{data:t}=await e.from(`categories`).select(`*`).order(`sort_order`,{ascending:!0});i=t||[]}async function c(){let{data:t}=await e.from(`products`).select(`
      *,
      categories(name, slug),
      product_colors(*),
      product_images(*)
    `).eq(`is_active`,!0).order(`sort_order`,{ascending:!0});a=t||[]}function l(){let e=document.getElementById(`category-filters`);if(!e)return;e.innerHTML=`<button class="cat-filter active flex-shrink-0 whitespace-nowrap bg-leather-700 text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg transition-all hover:bg-leather-900" data-cat="">Todos</button>`+i.map(e=>`<button class="cat-filter flex-shrink-0 whitespace-nowrap bg-white text-leather-700 border border-leather-200 px-5 py-2 rounded-full text-sm font-medium transition-all hover:border-leather-700" data-cat="${e.id}">${d(e.name)}</button>`).join(``);let t=e.querySelectorAll(`.cat-filter`);t.forEach(e=>{e.addEventListener(`click`,()=>{o=e.dataset.cat,t.forEach(e=>{e.classList.remove(`active`,`bg-leather-700`,`text-white`,`shadow-lg`),e.classList.add(`bg-white`,`text-leather-700`,`border-leather-200`)}),e.classList.add(`active`,`bg-leather-700`,`text-white`,`shadow-lg`),e.classList.remove(`bg-white`,`text-leather-700`,`border-leather-200`),e.scrollIntoView({behavior:`smooth`,block:`nearest`,inline:`center`}),u()})});let n=e.closest(`.scroll-mask`);if(n){let t=()=>{let{scrollLeft:t,scrollWidth:r,clientWidth:i}=e;n.classList.toggle(`scrolled-left`,t>10),n.classList.toggle(`scrolled-right`,t+i>=r-10)};e.addEventListener(`scroll`,t),t(),window.addEventListener(`resize`,t);let r=n.querySelector(`.arrow-left`),i=n.querySelector(`.arrow-right`);r&&i&&(r.onclick=()=>{e.scrollBy({left:-200,behavior:`smooth`})},i.onclick=()=>{e.scrollBy({left:200,behavior:`smooth`})})}}function u(){let e=document.getElementById(`products-grid`);if(!e)return;let t=a;if(o&&(t=a.filter(e=>e.category_id===o)),t.length===0){e.innerHTML=`
      <div class="col-span-full text-center py-20">
        <i class="fa-solid fa-box-open text-5xl text-leather-300 mb-4"></i>
        <p class="text-gray-500 text-lg">No hay productos en esta categoría aún</p>
      </div>
    `;return}e.innerHTML=t.map((e,t)=>{let i=(e.product_images||[]).sort((e,t)=>e.is_primary?-1:t.is_primary?1:e.sort_order-t.sort_order),a=i[0],o=a?a.image_url:``,s=o?r(o,`thumbnail`):`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23f3f4f6" width="400" height="300"/><text fill="%239ca3af" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="16">Sin imagen</text></svg>`,c=o?n(o,[300,500,800],70):``,l=e.categories?.name||``,u=e.product_colors||[],f=t%3*100;return`
      <a href="${`producto.html?id=${e.id}`}" class="product-card reveal block" style="transition-delay: ${f}ms;">
        <!-- Image Container -->
        <div class="product-image-container relative">
          <img src="${s}" ${c?`srcset="${c}" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"`:``} alt="${d(e.name)}" class="product-image" loading="lazy" decoding="async">
          ${i.length>1?`
            <div class="absolute bottom-3 right-3 bg-white/90 text-leather-900 text-xs px-2 py-1 rounded-full font-medium">
              <i class="fa-solid fa-images mr-1"></i>${i.length} fotos
            </div>
          `:``}
          <div class="absolute top-4 right-4 bg-leather-700 text-white text-xs px-3 py-1 rounded-full uppercase tracking-tighter font-bold">
            ${d(l)}
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <!-- Content -->
        <div class="p-8">
          <h3 class="text-2xl font-serif font-bold text-leather-950 mb-3">${d(e.name)}</h3>
          <p class="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">${d(e.description||``)}</p>

          ${u.length>0?`
            <div class="mb-5">
              <div class="flex flex-wrap gap-2">
                ${u.map(e=>`
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
    `}).join(``),setTimeout(f,50)}function d(e){if(!e)return``;let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function f(){let e=document.querySelectorAll(`.reveal`);for(let t=0;t<e.length;t++){let n=window.innerHeight;e[t].getBoundingClientRect().top<n-100&&e[t].classList.add(`active`)}}window.addEventListener(`scroll`,f);