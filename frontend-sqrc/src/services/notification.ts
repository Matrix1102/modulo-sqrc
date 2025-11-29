export type ToastType = 'info' | 'success' | 'error' | 'warning';

const containerId = 'global-toast-container';

function ensureContainer() {
  let c = document.getElementById(containerId);
  if (!c) {
    c = document.createElement('div');
    c.id = containerId;
    c.style.position = 'fixed';
    c.style.top = '1rem';
    c.style.right = '1rem';
    c.style.zIndex = '9999';
    c.style.display = 'flex';
    c.style.flexDirection = 'column';
    c.style.gap = '0.5rem';
    document.body.appendChild(c);
  }
  return c;
}

export function showToast(message: string, type: ToastType = 'info', ttl = 3500) {
  if (typeof document === 'undefined') {
    // server-side guard
    // eslint-disable-next-line no-console
    console.log(`${type}: ${message}`);
    return;
  }

  const container = ensureContainer();
  const el = document.createElement('div');
  el.textContent = message;
  el.style.padding = '10px 14px';
  el.style.borderRadius = '8px';
  el.style.color = '#fff';
  el.style.fontSize = '14px';
  el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
  el.style.opacity = '0';
  el.style.transition = 'opacity 200ms ease, transform 200ms ease';
  el.style.transform = 'translateY(-6px)';

  switch (type) {
    case 'success':
      el.style.background = '#16a34a';
      break;
    case 'error':
      el.style.background = '#dc2626';
      break;
    case 'warning':
      el.style.background = '#d97706';
      break;
    default:
      el.style.background = '#0ea5e9';
  }

  container.appendChild(el);

  // trigger enter
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });

  const remove = () => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-6px)';
    setTimeout(() => {
      try {
        container.removeChild(el);
      } catch (e) {
        // ignore
      }
    }, 200);
  };

  const timeout = setTimeout(remove, ttl);

  el.addEventListener('click', () => {
    clearTimeout(timeout);
    remove();
  });
}

export default showToast;
