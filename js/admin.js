import { supabase } from './supabase-config.js';
import { optimizeImage, createPreview } from './image-optimizer.js';

// ==================== STATE ====================
let categories = [];
let products = [];
let currentColors = [];       // [{color_name, hex_value, id?}]
let currentImages = [];        // [{file?, url?, id?, is_new}]
let pendingDeleteFn = null;

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async () => {
  // Check existing session
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    showDashboard();
  }

  // Login form
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  // Tabs
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Category
  document.getElementById('btn-new-category').addEventListener('click', () => openCategoryModal());
  document.getElementById('category-form').addEventListener('submit', handleCategorySubmit);

  // Product
  document.getElementById('btn-new-product').addEventListener('click', () => openProductModal());
  document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
  document.getElementById('btn-add-color').addEventListener('click', addColor);
  document.getElementById('image-upload').addEventListener('change', handleImageSelect);
  document.getElementById('filter-category').addEventListener('change', renderProducts);

  // Delete modal
  document.getElementById('delete-cancel-btn').addEventListener('click', closeDeleteModal);
  document.getElementById('delete-confirm-btn').addEventListener('click', () => {
    if (pendingDeleteFn) pendingDeleteFn();
    closeDeleteModal();
  });
});

// ==================== AUTH ====================
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');

  errorEl.classList.add('hidden');
  document.getElementById('login-btn').textContent = 'Ingresando...';

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    errorEl.textContent = 'Credenciales inválidas. Verifique su correo y contraseña.';
    errorEl.classList.remove('hidden');
    document.getElementById('login-btn').textContent = 'Iniciar Sesión';
    return;
  }

  showDashboard();
}

async function handleLogout() {
  await supabase.auth.signOut();
  document.getElementById('admin-dashboard').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
}

async function showDashboard() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('admin-dashboard').classList.remove('hidden');
  await loadCategories();
  await loadProducts();
}

// ==================== TABS ====================
function switchTab(tabName) {
  document.querySelectorAll('.admin-tab').forEach(t => {
    t.classList.remove('active-tab', 'text-leather-700', 'border-b-2', 'border-leather-700');
    t.classList.add('text-gray-500');
  });
  const active = document.querySelector(`[data-tab="${tabName}"]`);
  active.classList.add('active-tab', 'text-leather-700', 'border-b-2', 'border-leather-700');
  active.classList.remove('text-gray-500');

  document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
  document.getElementById(`tab-${tabName}`).classList.remove('hidden');
}

// ==================== CATEGORIES ====================
async function loadCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) { toast('Error cargando categorías', 'error'); return; }
  categories = data || [];
  renderCategories();
  populateCategorySelects();
}

function renderCategories() {
  const container = document.getElementById('categories-list');
  const empty = document.getElementById('categories-empty');

  if (categories.length === 0) {
    container.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  container.innerHTML = categories.map(cat => `
    <div class="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-semibold text-leather-950 text-lg">${esc(cat.name)}</h3>
          <p class="text-gray-500 text-sm mt-1">${esc(cat.description || 'Sin descripción')}</p>
          <span class="inline-block mt-3 text-xs text-leather-500 bg-leather-50 px-3 py-1 rounded-full">Orden: ${cat.sort_order}</span>
        </div>
        <div class="flex gap-2">
          <button onclick="window._editCategory('${cat.id}')" class="text-gray-400 hover:text-leather-700 transition-colors p-2">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button onclick="window._deleteCategory('${cat.id}', '${esc(cat.name)}')" class="text-gray-400 hover:text-red-500 transition-colors p-2">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function populateCategorySelects() {
  const options = categories.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');

  const productSelect = document.getElementById('product-category');
  productSelect.innerHTML = '<option value="">Seleccionar categoría</option>' + options;

  const filterSelect = document.getElementById('filter-category');
  filterSelect.innerHTML = '<option value="">Todas las categorías</option>' + options;
}

function openCategoryModal(cat = null) {
  document.getElementById('category-modal-title').textContent = cat ? 'Editar Categoría' : 'Nueva Categoría';
  document.getElementById('category-id').value = cat ? cat.id : '';
  document.getElementById('category-name').value = cat ? cat.name : '';
  document.getElementById('category-desc').value = cat ? (cat.description || '') : '';
  document.getElementById('category-order').value = cat ? cat.sort_order : categories.length;
  document.getElementById('category-modal').classList.remove('hidden');
}

window.closeCategoryModal = function() {
  document.getElementById('category-modal').classList.add('hidden');
};

async function handleCategorySubmit(e) {
  e.preventDefault();
  const id = document.getElementById('category-id').value;
  const name = document.getElementById('category-name').value.trim();
  const description = document.getElementById('category-desc').value.trim();
  const sort_order = parseInt(document.getElementById('category-order').value) || 0;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  showLoading('Guardando categoría...');

  if (id) {
    const { error } = await supabase.from('categories').update({ name, slug, description, sort_order }).eq('id', id);
    if (error) { hideLoading(); toast('Error actualizando categoría', 'error'); return; }
    toast('Categoría actualizada');
  } else {
    const { error } = await supabase.from('categories').insert({ name, slug, description, sort_order });
    if (error) { hideLoading(); toast('Error creando categoría', 'error'); return; }
    toast('Categoría creada');
  }

  hideLoading();
  closeCategoryModal();
  await loadCategories();
}

window._editCategory = function(id) {
  const cat = categories.find(c => c.id === id);
  if (cat) openCategoryModal(cat);
};

window._deleteCategory = function(id, name) {
  openDeleteModal(`¿Eliminar la categoría "${name}" y todos sus productos?`, async () => {
    showLoading('Eliminando...');
    const { error } = await supabase.from('categories').delete().eq('id', id);
    hideLoading();
    if (error) { toast('Error eliminando categoría', 'error'); return; }
    toast('Categoría eliminada');
    await loadCategories();
    await loadProducts();
  });
};

// ==================== PRODUCTS ====================
async function loadProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(name),
      product_colors(*),
      product_images(*)
    `)
    .order('sort_order', { ascending: true });

  if (error) { toast('Error cargando productos', 'error'); return; }
  products = data || [];
  renderProducts();
}

function renderProducts() {
  const container = document.getElementById('products-list');
  const empty = document.getElementById('products-empty');
  const filterVal = document.getElementById('filter-category').value;

  let filtered = products;
  if (filterVal) {
    filtered = products.filter(p => p.category_id === filterVal);
  }

  if (filtered.length === 0) {
    container.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  container.innerHTML = filtered.map(prod => {
    const primaryImg = prod.product_images?.find(i => i.is_primary) || prod.product_images?.[0];
    const imgSrc = primaryImg ? primaryImg.image_url : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23f3f4f6" width="400" height="300"/><text fill="%239ca3af" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="16">Sin imagen</text></svg>';
    const catName = prod.categories?.name || 'Sin categoría';
    const colors = prod.product_colors || [];

    return `
      <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 transition-all">
        <div class="h-48 overflow-hidden relative bg-gray-50">
          <img src="${imgSrc}" alt="${esc(prod.name)}" class="w-full h-full object-cover">
          <span class="absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-bold ${prod.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
            ${prod.is_active ? 'Activo' : 'Inactivo'}
          </span>
          <span class="absolute top-3 left-3 text-xs px-3 py-1 rounded-full bg-leather-700 text-white font-bold">${esc(catName)}</span>
        </div>
        <div class="p-5">
          <h3 class="font-semibold text-leather-950 text-lg mb-1">${esc(prod.name)}</h3>
          <p class="text-gray-500 text-sm mb-3 line-clamp-2">${esc(prod.description || '')}</p>
          ${colors.length > 0 ? `
            <div class="flex flex-wrap gap-1.5 mb-4">
              ${colors.map(c => `<div class="color-circle" style="background:${c.hex_value}" title="${esc(c.color_name)}"></div>`).join('')}
            </div>
          ` : ''}
          <div class="flex gap-2 border-t border-gray-100 pt-3 mt-3">
            <button onclick="window._editProduct('${prod.id}')" class="flex-1 text-center py-2 text-leather-700 hover:bg-leather-50 rounded-lg transition-colors text-sm font-medium">
              <i class="fa-solid fa-pen-to-square mr-1"></i>Editar
            </button>
            <button onclick="window._deleteProduct('${prod.id}', '${esc(prod.name)}')" class="flex-1 text-center py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium">
              <i class="fa-solid fa-trash mr-1"></i>Eliminar
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openProductModal(prod = null) {
  document.getElementById('product-modal-title').textContent = prod ? 'Editar Producto' : 'Nuevo Producto';
  document.getElementById('product-id').value = prod ? prod.id : '';
  document.getElementById('product-name').value = prod ? prod.name : '';
  document.getElementById('product-desc').value = prod ? (prod.description || '') : '';
  document.getElementById('product-category').value = prod ? prod.category_id : '';
  document.getElementById('product-active').checked = prod ? prod.is_active : true;

  // Colors
  currentColors = prod ? (prod.product_colors || []).map(c => ({ ...c })) : [];
  renderColorPreviews();

  // Images
  currentImages = prod ? (prod.product_images || []).map(img => ({ url: img.image_url, id: img.id, is_new: false, is_primary: img.is_primary })) : [];
  renderImagePreviews();

  document.getElementById('product-modal').classList.remove('hidden');
}

window.closeProductModal = function() {
  document.getElementById('product-modal').classList.add('hidden');
  currentColors = [];
  currentImages = [];
};

// -- Colors --
function addColor() {
  const hexInput = document.getElementById('color-hex-input');
  const hex = hexInput.value;

  // Auto-generate a name from the hex value
  currentColors.push({ color_name: hex, hex_value: hex });
  renderColorPreviews();
}

function renderColorPreviews() {
  const container = document.getElementById('colors-preview');
  container.innerHTML = currentColors.map((c, i) => `
    <div class="relative group">
      <div class="color-circle" style="background:${c.hex_value};" title="${c.hex_value}"></div>
      <button type="button" onclick="window._removeColor(${i})" class="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"><i class="fa-solid fa-xmark"></i></button>
    </div>
  `).join('');
}

window._removeColor = function(index) {
  currentColors.splice(index, 1);
  renderColorPreviews();
};

// -- Images --
async function handleImageSelect(e) {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  showLoading('Procesando imágenes...');

  for (const file of files) {
    try {
      const preview = await createPreview(file);
      currentImages.push({ file, preview, is_new: true, is_primary: currentImages.length === 0 });
    } catch (err) {
      console.error('Error processing image:', file.name, err);
      toast(`Error con "${file.name}": formato no soportado`, 'error');
    }
  }

  hideLoading();
  renderImagePreviews();
  e.target.value = '';
}

function renderImagePreviews() {
  const container = document.getElementById('images-preview');
  container.innerHTML = currentImages.map((img, i) => {
    const src = img.preview || img.url;
    return `
      <div class="relative group">
        <img src="${src}" class="img-preview ${img.is_primary ? 'ring-2 ring-leather-500' : ''}">
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
          <button type="button" onclick="window._setPrimaryImage(${i})" class="text-white text-xs bg-leather-700 px-2 py-1 rounded" title="Principal">
            <i class="fa-solid fa-star"></i>
          </button>
          <button type="button" onclick="window._removeImage(${i})" class="text-white text-xs bg-red-500 px-2 py-1 rounded" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        ${img.is_primary ? '<span class="absolute -top-1 -right-1 bg-leather-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]"><i class="fa-solid fa-star"></i></span>' : ''}
      </div>
    `;
  }).join('');
}

window._removeImage = function(index) {
  currentImages.splice(index, 1);
  if (currentImages.length > 0 && !currentImages.some(i => i.is_primary)) {
    currentImages[0].is_primary = true;
  }
  renderImagePreviews();
};

window._setPrimaryImage = function(index) {
  currentImages.forEach((img, i) => img.is_primary = (i === index));
  renderImagePreviews();
};

// -- Submit Product --
async function handleProductSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('product-id').value;
  const name = document.getElementById('product-name').value.trim();
  const description = document.getElementById('product-desc').value.trim();
  const category_id = document.getElementById('product-category').value;
  const is_active = document.getElementById('product-active').checked;

  if (!category_id) { toast('Selecciona una categoría', 'error'); return; }

  showLoading('Guardando producto...');

  try {
    let productId = id;

    // 1. Upsert product
    if (id) {
      const { error } = await supabase.from('products').update({ name, description, category_id, is_active }).eq('id', id);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from('products').insert({ name, description, category_id, is_active, sort_order: products.length }).select().single();
      if (error) throw error;
      productId = data.id;
    }

    // 2. Sync colors: delete old, insert all
    await supabase.from('product_colors').delete().eq('product_id', productId);
    if (currentColors.length > 0) {
      const colorsToInsert = currentColors.map(c => ({
        product_id: productId,
        color_name: c.color_name,
        hex_value: c.hex_value
      }));
      const { error } = await supabase.from('product_colors').insert(colorsToInsert);
      if (error) throw error;
    }

    // 3. Upload new images
    const existingImageIds = currentImages.filter(i => !i.is_new && i.id).map(i => i.id);

    // Delete removed images from storage + db
    if (id) {
      const { data: oldImages } = await supabase.from('product_images').select('*').eq('product_id', productId);
      if (oldImages) {
        for (const oldImg of oldImages) {
          if (!existingImageIds.includes(oldImg.id)) {
            // Delete from storage
            const path = extractStoragePath(oldImg.image_url);
            if (path) await supabase.storage.from('product-images').remove([path]);
            // Delete from db
            await supabase.from('product_images').delete().eq('id', oldImg.id);
          }
        }
      }
    }

    // Upload new images
    for (const img of currentImages) {
      if (img.is_new && img.file) {
        showLoading('Optimizando y subiendo imágenes...');
        const { blob, filename } = await optimizeImage(img.file);
        const storagePath = `${productId}/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(storagePath, blob, { contentType: 'image/webp', upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(storagePath);
        const image_url = urlData.publicUrl;

        await supabase.from('product_images').insert({
          product_id: productId,
          image_url,
          is_primary: img.is_primary,
          sort_order: currentImages.indexOf(img)
        });
      } else if (!img.is_new && img.id) {
        // Update is_primary for existing
        await supabase.from('product_images').update({ is_primary: img.is_primary }).eq('id', img.id);
      }
    }

    hideLoading();
    toast(id ? 'Producto actualizado' : 'Producto creado');
    closeProductModal();
    await loadProducts();

  } catch (err) {
    hideLoading();
    console.error(err);
    toast('Error guardando producto: ' + err.message, 'error');
  }
}

window._editProduct = function(id) {
  const prod = products.find(p => p.id === id);
  if (prod) openProductModal(prod);
};

window._deleteProduct = function(id, name) {
  openDeleteModal(`¿Eliminar el producto "${name}"?`, async () => {
    showLoading('Eliminando producto...');
    try {
      // Delete images from storage
      const { data: imgs } = await supabase.from('product_images').select('image_url').eq('product_id', id);
      if (imgs) {
        for (const img of imgs) {
          const path = extractStoragePath(img.image_url);
          if (path) await supabase.storage.from('product-images').remove([path]);
        }
      }
      await supabase.from('products').delete().eq('id', id);
      hideLoading();
      toast('Producto eliminado');
      await loadProducts();
    } catch (err) {
      hideLoading();
      toast('Error eliminando producto', 'error');
    }
  });
};

// ==================== DELETE MODAL ====================
function openDeleteModal(text, onConfirm) {
  document.getElementById('delete-modal-text').textContent = text;
  document.getElementById('delete-modal').classList.remove('hidden');
  pendingDeleteFn = onConfirm;
}

function closeDeleteModal() {
  document.getElementById('delete-modal').classList.add('hidden');
  pendingDeleteFn = null;
}

// ==================== UTILITIES ====================
function showLoading(text = 'Procesando...') {
  document.getElementById('loading-text').textContent = text;
  document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loading-overlay').classList.add('hidden');
}

function toast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const bg = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  const el = document.createElement('div');
  el.className = `toast ${bg} text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm font-medium`;
  el.innerHTML = `<i class="fa-solid ${icon}"></i> ${esc(message)}`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function esc(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function extractStoragePath(url) {
  // Extract the storage path from a Supabase public URL
  const marker = '/storage/v1/object/public/product-images/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.substring(idx + marker.length));
}
