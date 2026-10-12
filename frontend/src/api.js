async function request(path, options) {
  let response;
  try {
    response = await fetch('/api' + path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers }
    });
  } catch {
    throw new Error('Could not connect to the shop API. Check that the backend is running.');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || 'Something went wrong. Please try again.');
  }
  return data;
}

export function getCategories() {
  return request('/categories');
}

export function getProducts({ search = '', category = 'All', sort = 'featured' } = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());
  if (category !== 'All') params.set('category', category);
  if (sort !== 'featured') params.set('sort', sort);
  const query = params.toString();
  return request('/products' + (query ? '?' + query : ''));
}

export function createOrder(order) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(order)
  });
}
