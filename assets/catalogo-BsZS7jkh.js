import{t as e}from"./supabase-config-xTA2IjZq.js";import{n as t,r as n,t as r}from"./supabase-image-Dtm2Wkp6.js";var i=[],a=[],o=``,s=``;document.addEventListener(`DOMContentLoaded`,async()=>{await Promise.all([c(),l()]);let e=a.find(e=>e.product_images?.length)?.product_images?.[0]?.image_url;e&&await t(e),p(),h(),d(),v(),setTimeout(x,100)});async function c(){let{data:t}=await e.from(`categories`).select(`*`).order(`sort_order`,{ascending:!0});i=t||[]}async function l(){let{data:t}=await e.from(`products`).select(`
      *,
      categories(name, slug),
      product_colors(*),
      product_images(*)
    `).eq(`is_active`,!0).order(`sort_order`,{ascending:!0});a=t||[],u()}function u(){let e=document.getElementById(`sections-list`);e&&(e.innerHTML=[...new Set(a.map(e=>e.section_title).filter(e=>e&&e.trim()!==``))].sort().map(e=>`<option value="${e}">`).join(``))}function d(){let e=document.getElementById(`search-input`),t=document.getElementById(`search-clear`);!e||!t||(e.addEventListener(`input`,()=>{s=e.value;let n=s.trim().length>0;t.style.opacity=n?`1`:`0`,t.style.pointerEvents=n?`auto`:`none`,v()}),t.addEventListener(`click`,()=>{e.value=``,s=``,t.style.opacity=`0`,t.style.pointerEvents=`none`,e.focus(),v()}))}function f(e){return e?e.toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``):``}function p(){let e=document.getElementById(`sidebar-filters`);if(!e)return;let t=a.length,n={};a.forEach(e=>{e.category_id&&(n[e.category_id]=(n[e.category_id]||0)+1)});let r=`<div class="space-y-0.5">`;r+=m(``,`Todos`,o===``,t),i.forEach(e=>{r+=m(e.id,e.name,o===e.id,n[e.id]||0)}),r+=`</div>`,e.innerHTML=r,e.querySelectorAll(`.sidebar-btn`).forEach(e=>{e.addEventListener(`click`,()=>_(e.dataset.cat))})}function m(e,t,n,r){return`<button class="sidebar-btn ${n?`active`:``}" data-cat="${e}">
    <span style="display:flex;align-items:center;gap:8px;min-width:0">
      <span class="s-dot"></span>
      <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${b(t)}</span>
    </span>
    <span class="s-count">${r}</span>
  </button>`}function h(){let e=document.getElementById(`mobile-category-filters`);if(!e)return;let t=g(``,`Todos`,o===``);i.forEach(e=>{t+=g(e.id,e.name,o===e.id)}),e.innerHTML=t,e.querySelectorAll(`.mob-cat-btn`).forEach(e=>{e.addEventListener(`click`,()=>{_(e.dataset.cat),typeof closeMobileSidebar==`function`&&closeMobileSidebar()})})}function g(e,t,n){return`<button class="mob-cat-btn ${n?`active`:``}" data-cat="${e}">${b(t)}</button>`}function _(e){o=e,document.querySelectorAll(`#sidebar-filters .sidebar-btn`).forEach(e=>{e.classList.toggle(`active`,e.dataset.cat===o)}),document.querySelectorAll(`#mobile-category-filters .mob-cat-btn`).forEach(e=>{e.classList.toggle(`active`,e.dataset.cat===o)}),v()}function v(){let e=document.getElementById(`products-grid`),t=document.getElementById(`results-count`);if(!e)return;let i=a;o&&(i=a.filter(e=>e.category_id===o));let c=f(s.trim());if(c&&(i=i.filter(e=>f(e.name).includes(c)||f(e.description||``).includes(c))),t)if(c||o){let e=i.length;t.textContent=e===1?`1 producto encontrado`:`${e} productos encontrados`,t.style.display=`block`}else t.style.display=`none`;if(i.length===0){e.innerHTML=`
      <div class="col-span-full text-center py-20">
        <i class="fa-solid fa-box-open text-5xl text-leather-300 mb-4"></i>
        <p class="text-gray-500 text-lg">No se encontraron productos</p>
        <p class="text-sm text-gray-400 mt-1">Intenta con otro término o categoría</p>
      </div>
    `;return}i.sort((e,t)=>{let n=(e.section_title||``).trim(),r=(t.section_title||``).trim();return n===``&&r===``?(e.sort_order||0)-(t.sort_order||0):n===``?-1:r===``?1:n===r?(e.sort_order||0)-(t.sort_order||0):n.localeCompare(r)});let l=``,u=null;i.forEach((e,t)=>{e.section_title&&e.section_title!==u?(u=e.section_title,l+=`
        <div class="col-span-full pt-12 pb-6">
          <div class="flex items-center gap-4">
            <div class="h-px bg-leather-200 flex-1"></div>
            <h2 class="text-xl md:text-2xl font-serif font-bold text-leather-950 px-6 text-center uppercase tracking-widest bg-leather-50 rounded-full py-1 border border-leather-100 shadow-sm">${b(u)}</h2>
            <div class="h-px bg-leather-200 flex-1"></div>
          </div>
        </div>
      `):!e.section_title&&u!==null&&(u=null);let i=(e.product_images||[]).sort((e,t)=>e.is_primary?-1:t.is_primary?1:e.sort_order-t.sort_order),a=i[0],o=a?a.image_url:``,d=o?r(o,`thumbnail`):`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23f3f4f6" width="400" height="300"/><text fill="%239ca3af" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="16">Sin imagen</text></svg>`,f=o?n(o,[300,500,800],70):``,p=e.product_colors||[],m=c?y(b(e.name),s):b(e.name),h=c?y(b(e.description||``),s):b(e.description||``);l+=`
      <a href="producto.html?id=${e.id}" class="product-card reveal block group" style="transition-delay: ${t%3*100}ms;">
        <!-- Image Container -->
        <div class="product-image-container relative overflow-hidden">
          <img src="${d}" ${f?`srcset="${f}" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"`:``} alt="${b(e.name)}" class="product-image w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async">
          ${i.length>1?`
            <div class="absolute bottom-3 right-3 bg-white/90 text-leather-900 text-xs px-2 py-1 rounded-full font-medium z-10">
              <i class="fa-solid fa-images mr-1"></i>${i.length} fotos
            </div>
          `:``}
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <!-- Content -->
        <div class="p-8">
          <h3 class="text-2xl font-serif font-bold text-leather-950 mb-3 group-hover:text-leather-700 transition-colors">${m}</h3>
          <p class="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">${h}</p>

          ${p.length>0?`
            <div class="mb-5">
              <div class="flex flex-wrap gap-2">
                ${p.map(e=>`
                  <div class="w-7 h-7 rounded-full border-2 border-gray-100 shadow-sm" style="background:${e.hex_value}" title="${b(e.color_name)}"></div>
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
    `}),e.innerHTML=l,setTimeout(x,50)}function y(e,t){if(!t.trim())return e;try{let n=t.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`);return e.replace(RegExp(`(${n})`,`gi`),`<mark style="background:rgba(212,184,149,0.5);border-radius:2px;padding:0 2px">$1</mark>`)}catch{return e}}function b(e){if(!e)return``;let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function x(){let e=document.querySelectorAll(`.reveal`);for(let t=0;t<e.length;t++){let n=window.innerHeight;e[t].getBoundingClientRect().top<n-100&&e[t].classList.add(`active`)}}window.addEventListener(`scroll`,x);