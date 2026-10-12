import { useEffect, useMemo, useState } from 'react';
import { createOrder, getCategories, getProducts } from './api.js';

const money = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
}).format(value);

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('good-goods-cart') || '[]');
    return Array.isArray(saved) ? saved.filter(item => item?.product?.id && item.quantity > 0) : [];
  } catch {
    return [];
  }
}

function BagIcon({ size = 21 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M4 8h16l-1.5 12h-13L4 8Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

function ArrowIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ProductCard({ product, onAdd }) {
  return (
    <article className="product-card">
      <div className="product-art" style={{ '--tone': product.accent }}>
        <div className="product-decoration one" />
        <div className="product-decoration two" />
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <span className="product-emoji" role="img" aria-label={product.name}>
          {product.emoji}
        </span>
        <button className="quick-add" type="button" onClick={() => onAdd(product)}
          aria-label={'Add ' + product.name + ' to cart'}>
          + Add to bag
        </button>
      </div>
      <div className="product-meta">
        <span className="product-category">{product.category}</span>
        <span className="product-price">{money(product.price)}</span>
      </div>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
    </article>
  );
}

function CartRow({ item, onQuantity, onRemove }) {
  return (
    <div className="cart-row">
      <div className="cart-art" style={{ backgroundColor: item.product.accent }}>
        <span role="img" aria-label={item.product.name}>{item.product.emoji}</span>
      </div>
      <div className="cart-item-details">
        <div className="cart-row-top">
          <div>
            <span className="product-category">{item.product.category}</span>
            <h4>{item.product.name}</h4>
          </div>
          <strong>{money(item.product.price * item.quantity)}</strong>
        </div>
        <div className="cart-row-bottom">
          <div className="quantity-stepper">
            <button type="button" aria-label={'Decrease ' + item.product.name}
              onClick={() => onQuantity(item.product.id, -1)}>−</button>
            <span>{item.quantity}</span>
            <button type="button" aria-label={'Increase ' + item.product.name}
              onClick={() => onQuantity(item.product.id, 1)}>+</button>
          </div>
          <button className="text-button" type="button"
            onClick={() => onRemove(item.product.id)}>Remove</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [cart, setCart] = useState(loadCart);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartStage, setCartStage] = useState('cart');
  const [checkout, setCheckout] = useState({ name: '', email: '', address: '' });
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    localStorage.setItem('good-goods-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    let active = true;
    getCategories()
      .then(data => { if (active) setCategories(data); })
      .catch(() => { /* The product request displays connection errors. */ });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    getProducts({ search, category, sort })
      .then(data => { if (active) setProducts(data); })
      .catch(error => { if (active) setLoadError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search, category, sort]);

  useEffect(() => {
    if (!drawerOpen) return;
    const closeOnEscape = event => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [drawerOpen]);

  const count = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );

  function showCart() {
    setCartStage('cart');
    setDrawerOpen(true);
  }

  function addToCart(product) {
    const current = cart.find(item => item.product.id === product.id);
    if (current && current.quantity >= product.stock) {
      setNotice('You already have the maximum available quantity in your bag.');
      return;
    }
    setNotice('');
    setCart(previous => {
      const existing = previous.find(item => item.product.id === product.id);
      if (existing) {
        return previous.map(item => item.product.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
          : item);
      }
      return [...previous, { product, quantity: 1 }];
    });
    showCart();
  }

  function changeQuantity(id, delta) {
    setCart(previous => previous
      .map(item => item.product.id === id
        ? { ...item, quantity: Math.min(item.product.stock, item.quantity + delta) }
        : item)
      .filter(item => item.quantity > 0));
  }

  function removeItem(id) {
    setCart(previous => previous.filter(item => item.product.id !== id));
  }

  async function placeOrder(event) {
    event.preventDefault();
    setCheckoutError('');
    setSubmitting(true);
    try {
      const order = await createOrder({
        customerName: checkout.name.trim(),
        email: checkout.email.trim(),
        address: checkout.address.trim(),
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      });
      setReceipt(order);
      setCart([]);
      setCartStage('success');
    } catch (error) {
      setCheckoutError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  function scrollToProducts() {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="site-shell">
      <div className="announcement">
        Everyday essentials, anything but ordinary <span>✳</span> Free shipping over $100
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <a className="wordmark" href="/" aria-label="Good Goods home">
            <span className="brand-glyph">✳</span> GOOD<span>GOODS</span><span className="brand-dot">.</span>
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#products">Shop all</a>
            <button type="button" onClick={() => { setCategory('Home'); scrollToProducts(); }}>For home</button>
            <button type="button" onClick={() => { setCategory('Tech'); scrollToProducts(); }}>Tech & more</button>
          </nav>
          <button className="cart-trigger" type="button" onClick={showCart} aria-label={'Open bag, ' + count + ' items'}>
            <BagIcon />
            <span>Bag</span>
            <span className="cart-count">{count}</span>
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section container" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> THE EVERYDAY EDIT / 001</div>
            <h1 id="hero-title">Good things.<br /><em>Better days.</em></h1>
            <p>Discover thoughtfully curated essentials for your space, your routine, and everywhere in between.</p>
            <button className="hero-cta" type="button" onClick={scrollToProducts}>
              Explore the collection <ArrowIcon />
            </button>
            <div className="hero-bottom"><span>✳</span> MADE FOR THE WAY YOU LIVE</div>
          </div>
          <div className="hero-visual">
            <div className="hero-orbit orbit-a" />
            <div className="hero-orbit orbit-b" />
            <div className="hero-center-symbol" aria-hidden="true">✳</div>
            <span className="hero-sticker sticker-top">little joys,<br />daily.</span>
            <span className="hero-sticker sticker-bottom">GOOD STUFF<br />INSIDE ↗</span>
            <div className="hero-label">YOUR NEW FAVORITES AWAIT <span>↗</span></div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Our promises">
          <div className="container trust-inner">
            <span>✳ Thoughtfully selected</span>
            <span>↗ Everyday inspiration</span>
            <span>♡ Made to be loved</span>
            <span>◌ Simple, easy shopping</span>
          </div>
        </section>

        <section id="products" className="collection-section container" aria-labelledby="collection-title">
          <div className="collection-heading">
            <div>
              <div className="eyebrow">DISCOVER YOUR NEXT FAVORITE</div>
              <h2 id="collection-title">The good stuff<span className="green-star">✳</span></h2>
              <p>Interesting finds. Useful things. A little bit of everything.</p>
            </div>
            <div className="collection-number">01 / SHOP THE COLLECTION</div>
          </div>

          <div className="shop-toolbar">
            <div className="category-tabs" aria-label="Filter by category">
              {['All', ...categories].map(option => (
                <button key={option} className={category === option ? 'active' : ''}
                  type="button" onClick={() => setCategory(option)}>
                  {option === 'All' ? 'Shop all' : option}
                </button>
              ))}
            </div>
            <div className="search-sort">
              <label className="search-field">
                <span aria-hidden="true">⌕</span>
                <input type="search" placeholder="Search goods..." value={search}
                  onChange={event => setSearch(event.target.value)} aria-label="Search products" />
              </label>
              <label className="sort-field">
                <span className="sr-only">Sort by</span>
                <select value={sort} onChange={event => setSort(event.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to high</option>
                  <option value="price-desc">Price: High to low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </label>
            </div>
          </div>

          <div className="results-label">{loading ? 'Finding your favorites...' :
            loadError ? 'Could not load products' :
            products.length + ' thoughtful finds'}</div>

          {loadError ? (
            <div className="empty-state error-state">
              <span aria-hidden="true">⚠</span>
              <h3>We hit a little snag.</h3>
              <p>{loadError}</p>
              <button type="button" onClick={() => { setSearch(''); setCategory('All'); setSort('featured'); }}>
                Reset filters
              </button>
            </div>
          ) : loading ? (
            <div className="product-grid" aria-label="Loading products">
              {[1, 2, 3, 4].map(number => <div className="product-skeleton" key={number} />)}
            </div>
          ) : products.length ? (
            <div className="product-grid">
              {products.map(product => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}
            </div>
          ) : (
            <div className="empty-state">
              <span aria-hidden="true">⌕</span>
              <h3>Nothing quite like that.</h3>
              <p>Try a different search or browse another category.</p>
              <button type="button" onClick={() => { setSearch(''); setCategory('All'); }}>Show everything</button>
            </div>
          )}
        </section>

        <section className="newsletter-band">
          <div className="container newsletter-inner">
            <div>
              <span>OUR PHILOSOPHY</span>
              <h2>Buy less. <em>Love more.</em></h2>
            </div>
            <p>We're fans of useful things and thoughtful details. Small upgrades to ordinary days.</p>
            <span className="newsletter-icon" aria-hidden="true">✳</span>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <a className="wordmark footer-logo" href="/">✳ GOOD<span>GOODS</span><span className="brand-dot">.</span></a>
          <span>Considered essentials for everyday living.</span>
          <span>© {new Date().getFullYear()} Good Goods · Demo storefront</span>
        </div>
      </footer>

      {notice && <div className="notice" role="status">
        {notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss notice">×</button>
      </div>}

      {drawerOpen && (
        <div className="drawer-layer">
          <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping bag">
            <div className="drawer-header">
              <div>
                <span className="eyebrow">YOUR EVERYDAY FAVORITES</span>
                <h2>{cartStage === 'checkout' ? 'Checkout' : cartStage === 'success' ? 'All done!' : 'Your bag'}<span className="green-star">✳</span></h2>
              </div>
              <button className="drawer-close" type="button" onClick={() => setDrawerOpen(false)} aria-label="Close bag">×</button>
            </div>

            {cartStage === 'success' && receipt ? (
              <div className="success-state">
                <div className="success-glyph">✓</div>
                <h3>Good things are coming.</h3>
                <p>Your simulated order has been placed successfully.</p>
                <div className="receipt">
                  <span>ORDER REFERENCE</span>
                  <strong>{receipt.id.slice(0, 8).toUpperCase()}</strong>
                  <span>ORDER TOTAL</span>
                  <strong>{money(receipt.total)}</strong>
                </div>
                <p className="demo-note">This is a demonstration shop. No payment was collected.</p>
                <button className="primary-button" type="button" onClick={() => setDrawerOpen(false)}>
                  Keep exploring <ArrowIcon />
                </button>
              </div>
            ) : cartStage === 'checkout' ? (
              <form className="checkout-form" onSubmit={placeOrder}>
                <button className="back-link" type="button" onClick={() => setCartStage('cart')}>← Back to bag</button>
                <h3>Let's get the details right.</h3>
                <p>Just a few details to complete your simulated order.</p>
                <label>Full name
                  <input required autoComplete="name" value={checkout.name}
                    onChange={event => setCheckout({ ...checkout, name: event.target.value })} placeholder="Alex Morgan" />
                </label>
                <label>Email address
                  <input required type="email" autoComplete="email" value={checkout.email}
                    onChange={event => setCheckout({ ...checkout, email: event.target.value })} placeholder="alex@example.com" />
                </label>
                <label>Delivery address
                  <textarea required rows="3" autoComplete="street-address" value={checkout.address}
                    onChange={event => setCheckout({ ...checkout, address: event.target.value })} placeholder="Street, city, postal code" />
                </label>
                {checkoutError && <div className="form-error" role="alert">{checkoutError}</div>}
                <div className="checkout-total"><span>Total</span><strong>{money(subtotal)}</strong></div>
                <button className="primary-button" disabled={submitting || cart.length === 0} type="submit">
                  {submitting ? 'Placing order...' : 'Place simulated order'} {!submitting && <ArrowIcon />}
                </button>
                <p className="demo-note">Demo only. No real payments or deliveries.</p>
              </form>
            ) : cart.length ? (
              <>
                <div className="drawer-items">
                  <p className="bag-count-label">{count} {count === 1 ? 'ITEM' : 'ITEMS'} IN YOUR BAG</p>
                  {cart.map(item => <CartRow key={item.product.id} item={item}
                    onQuantity={changeQuantity} onRemove={removeItem} />)}
                </div>
                <div className="drawer-footer">
                  <div className="subtotal-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
                  <p>Shipping and taxes calculated at checkout. This is a demo store.</p>
                  <button className="primary-button" type="button"
                    onClick={() => { setCheckoutError(''); setCartStage('checkout'); }}>
                    Continue to checkout <ArrowIcon />
                  </button>
                  <button type="button" className="continue-link" onClick={() => setDrawerOpen(false)}>
                    Continue shopping
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-bag">
                <div className="empty-bag-symbol"><BagIcon size={50} /></div>
                <h3>Something's missing.</h3>
                <p>Your bag is empty. Let's change that.</p>
                <button className="primary-button" type="button" onClick={() => setDrawerOpen(false)}>
                  Shop the collection <ArrowIcon />
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
