export async function showConfirm(message: string, title?: string): Promise<boolean> {
  if (typeof document === 'undefined') return Promise.resolve(false);

  return new Promise((resolve) => {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.zIndex = '10000';
    container.style.background = 'rgba(0,0,0,0.35)';

    const card = document.createElement('div');
    card.style.background = '#fff';
    card.style.padding = '18px';
    card.style.borderRadius = '12px';
    card.style.width = 'min(480px, 92vw)';
    card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.12)';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = '12px';

    if (title) {
      const h = document.createElement('div');
      h.style.fontWeight = '700';
      h.textContent = title;
      card.appendChild(h);
    }

    const msg = document.createElement('div');
    msg.style.color = '#374151';
    msg.style.fontSize = '14px';
    msg.textContent = message;
    card.appendChild(msg);

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.justifyContent = 'flex-end';
    actions.style.gap = '8px';

    const btnNo = document.createElement('button');
    btnNo.textContent = 'Cancelar';
    btnNo.style.padding = '8px 12px';
    btnNo.style.borderRadius = '8px';
    btnNo.style.border = '1px solid #e5e7eb';
    btnNo.style.background = '#fff';
    btnNo.onclick = () => {
      cleanup(false);
    };

    const btnYes = document.createElement('button');
    btnYes.textContent = 'Confirmar';
    btnYes.style.padding = '8px 12px';
    btnYes.style.borderRadius = '8px';
    btnYes.style.border = 'none';
    btnYes.style.background = '#0ea5e9';
    btnYes.style.color = '#fff';
    btnYes.onclick = () => {
      cleanup(true);
    };

    actions.appendChild(btnNo);
    actions.appendChild(btnYes);
    card.appendChild(actions);

    container.appendChild(card);
    document.body.appendChild(container);

    function cleanup(result: boolean) {
      try {
        document.body.removeChild(container);
      } catch (e) {
        // ignore
      }
      resolve(result);
    }
  });
}

export default showConfirm;
