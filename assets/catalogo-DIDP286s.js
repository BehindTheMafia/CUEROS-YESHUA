import{t as e}from"./supabase-config-xTA2IjZq.js";import{n as t,r as n,t as r}from"./supabase-image-Dtm2Wkp6.js";var i=[],a=[],o=``;document.addEventListener(`DOMContentLoaded`,async()=>{await Promise.all([s(),c()]);let e=a.find(e=>e.product_images?.length)?.product_images?.[0]?.image_url;e&&await t(e),u(),d(),setTimeout(p,100)});async function s(){let{data:t}=await e.from(`categories`).select(`*`).order(`sort_order`,{ascending:!0});i=t||[]}async function c(){let{data:t}=await e.from(`products`).select(`
      *,
      categories(name, slug),
      product_colors(*),
      product_images(*)
    `).eq(`is_active`,!0).order(`sort_order`,{ascending:!0});a=t||[],l(),d()}function l(){let e=document.getElementById(`sections-list`);e&&(e.innerHTML=[...new Set(a.map(e=>e.section_title).filter(e=>e&&e.trim()!==``))].sort().map(e=>`<option value="${e}">`).join(``))}function u(){let e=document.getElementById(`category-filters`);if(!e)return;e.innerHTML=`<button class="cat-filter active flex-shrink-0 whitespace-nowrap bg-leather-700 text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg transition-all hover:bg-leather-900" data-cat="">Todos</button>`+i.map(e=>`<button class="cat-filter flex-shrink-0 whitespace-nowrap bg-white text-leather-700 border border-leather-200 px-5 py-2 rounded-full text-sm font-medium transition-all hover:border-leather-700" data-cat="${e.id}">${f(e.name)}</button>`).join(``);let t=e.querySelectorAll(`.cat-filter`);t.forEach(e=>{e.addEventListener(`click`,()=>{o=e.dataset.cat,t.forEach(e=>{e.classList.remove(`active`,`bg-leather-700`,`text-white`,`shadow-lg`),e.classList.add(`bg-white`,`text-leather-700`,`border-leather-200`)}),e.classList.add(`active`,`bg-leather-700`,`text-white`,`shadow-lg`),e.classList.remove(`bg-white`,`text-leather-700`,`border-leather-200`),e.scrollIntoView({behavior:`smooth`,block:`nearest`,inline:`center`}),d()})});let n=document.getElementById(`filters-container`);if(n){let t=()=>{let{scrollLeft:t,scrollWidth:r,clientWidth:i}=e;n.classList.toggle(`can-scroll-left`,t>15),n.classList.toggle(`can-scroll-right`,t+i<r-15)};e.addEventListener(`scroll`,t),t(),window.addEventListener(`resize`,t);let r=document.getElementById(`btn-left`),i=document.getElementById(`btn-right`);r&&i&&(r.onclick=t=>{t.stopPropagation(),e.scrollBy({left:-250,behavior:`smooth`})},i.onclick=t=>{t.stopPropagation(),e.scrollBy({left:250,behavior:`smooth`})})}}function d(){let e=document.getElementById(`products-grid`);if(!e)return;let t=a;if(o&&(t=a.filter(e=>e.category_id===o)),t.length===0){e.innerHTML=`
      <div class="col-span-full text-center py-20">
        <i class="fa-solid fa-box-open text-5xl text-leather-300 mb-4"></i>
        <p class="text-gray-500 text-lg">No hay productos en esta categoría aún</p>
      </div>
    `;return}t.sort((e,t)=>{let n=(e.section_title||``).trim(),r=(t.section_title||``).trim();return n===``&&r===``?(e.sort_order||0)-(t.sort_order||0):n===``?-1:r===``?1:n===r?(e.sort_order||0)-(t.sort_order||0):n.localeCompare(r)});let i=``,s=null;t.forEach((e,t)=>{e.section_title&&e.section_title!==s?(s=e.section_title,i+=`
        <div class="col-span-full pt-12 pb-6">
          <div class="flex items-center gap-4">
            <div class="h-px bg-leather-200 flex-1"></div>
            <h2 class="text-xl md:text-2xl font-serif font-bold text-leather-950 px-6 text-center uppercase tracking-widest bg-leather-50 rounded-full py-1 border border-leather-100 shadow-sm">${f(s)}</h2>
            <div class="h-px bg-leather-200 flex-1"></div>
          </div>
        </div>
      `):!e.section_title&&s!==null&&(s=null);let a=(e.product_images||[]).sort((e,t)=>e.is_primary?-1:t.is_primary?1:e.sort_order-t.sort_order),o=a[0],c=o?o.image_url:``,l=c?r(c,`thumbnail`):`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23f3f4f6" width="400" height="300"/><text fill="%239ca3af" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="16">Sin imagen</text></svg>`,u=c?n(c,[300,500,800],70):``,d=e.product_colors||[];i+=`
      <a href="producto.html?id=${e.id}" class="product-card reveal block group" style="transition-delay: ${t%3*100}ms;">
        <!-- Image Container -->
        <div class="product-image-container relative overflow-hidden">
          <img src="${l}" ${u?`srcset="${u}" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"`:``} alt="${f(e.name)}" class="product-image w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async">
          ${a.length>1?`
            <div class="absolute bottom-3 right-3 bg-white/90 text-leather-900 text-xs px-2 py-1 rounded-full font-medium z-10">
              <i class="fa-solid fa-images mr-1"></i>${a.length} fotos
            </div>
          `:``}
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <!-- Content -->
        <div class="p-8">
          <h3 class="text-2xl font-serif font-bold text-leather-950 mb-3 group-hover:text-leather-700 transition-colors">${f(e.name)}</h3>
          <p class="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">${f(e.description||``)}</p>

          ${d.length>0?`
            <div class="mb-5">
              <div class="flex flex-wrap gap-2">
                ${d.map(e=>`
                  <div class="w-7 h-7 rounded-full border-2 border-gray-100 shadow-sm" style="background:${e.hex_value}" title="${f(e.color_name)}"></div>
                `).join(``)}
              </div>
            </div>
          `:``}

          <div class="flex items-center gap-2 text-leather-700 font-bold text-sm pt-4 border-t border-gray-100">
            <span>Ver detalles</span>
            <i class="fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-1"></i>
          </div>
        </div>
      </a>
    `}),e.innerHTML=i,setTimeout(p,50)}function f(e){if(!e)return``;let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function p(){let e=document.querySelectorAll(`.reveal`);for(let t=0;t<e.length;t++){let n=window.innerHeight;e[t].getBoundingClientRect().top<n-100&&e[t].classList.add(`active`)}}window.addEventListener(`scroll`,p);