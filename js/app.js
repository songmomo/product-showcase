// 展示页面逻辑

/**
 * 根据图片路径生成 Supabase Storage 公开访问 URL
 * @param {string} imagePath - 图片在 Storage 中的路径
 * @returns {string} 完整的公开访问 URL
 */
function getPublicImageUrl(imagePath) {
  if (CONFIG.DEMO_MODE) {
    // 本地测试模式：从 localStorage 读取 base64 图片
    try {
      var images = JSON.parse(localStorage.getItem('demo_images') || '{}');
      return images[imagePath] || '';
    } catch (e) {
      return '';
    }
  }
  return `${CONFIG.SUPABASE_URL}/storage/v1/object/public/${CONFIG.STORAGE_BUCKET}/${imagePath}`;
}

/**
 * 将商品对象渲染为 HTML 卡片字符串
 * @param {Object} product - 商品对象
 * @returns {string} HTML 卡片字符串
 */
function renderProductCard(product) {
  const imageUrl = getPublicImageUrl(product.image_url);
  const price = Number(product.price).toFixed(2);
  const sku = product.sku || '-';
  const quantity = product.quantity != null ? product.quantity : 0;

  return `<div class="product-card">
      <img class="product-card-image" src="${imageUrl}" alt="${product.name}" loading="lazy">
      <div class="product-card-body">
        <div class="product-card-name">${product.name}</div>
        <div class="product-card-price">${price}</div>
        <div class="product-card-meta">
          <span>货号：${sku}</span>
          <span>库存：${quantity}</span>
        </div>
      </div>
    </div>`;
}

/**
 * 从 Supabase 加载在售商品并渲染到页面
 */
async function loadProducts() {
  const grid = document.getElementById('product-grid');
  const emptyState = document.getElementById('empty-state');
  const errorState = document.getElementById('error-state');

  try {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 隐藏错误状态
    errorState.classList.add('hidden');

    if (!data || data.length === 0) {
      grid.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    grid.innerHTML = data.map(renderProductCard).join('');
  } catch (err) {
    grid.innerHTML = '';
    emptyState.classList.add('hidden');
    errorState.classList.remove('hidden');
  }
}

// 页面加载完成后自动加载商品
document.addEventListener('DOMContentLoaded', loadProducts);
