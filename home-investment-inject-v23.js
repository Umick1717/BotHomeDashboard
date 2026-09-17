(() => {
  'use strict';
  if (window.__MICK_INVESTMENT_HOME_V23__) return;
  window.__MICK_INVESTMENT_HOME_V23__ = true;

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'home-investment-widget.css?v=23';
  document.head.appendChild(css);

  const init = () => {
    const home = document.getElementById('home');
    if (!home || document.getElementById('mickInvestmentWidget')) return;

    const mount = document.createElement('div');
    mount.id = 'mickInvestmentWidget';
    mount.className = 'mick-investment-home-mount';
    home.insertAdjacentElement('afterend', mount);

    const script = document.createElement('script');
    script.src = 'home-investment-widget.js?v=23';
    script.defer = true;
    document.body.appendChild(script);

    const menu = document.querySelector('#mainMenu > ul');
    if (menu && !menu.querySelector('[data-mick-investment-menu]')) {
      const li = document.createElement('li');
      li.innerHTML = '<a data-mick-investment-menu="1" href="mick-investment.html?v=23"><i class="fas fa-chart-line"></i> Investment</a>';
      menu.appendChild(li);
    }

    const quick = document.querySelector('.quick-menu');
    if (quick && !quick.querySelector('[data-mick-investment-card]')) {
      const card = document.createElement('a');
      card.className = 'menu-card';
      card.href = 'mick-investment.html?v=23';
      card.dataset.mickInvestmentCard = '1';
      card.style.color = 'inherit';
      card.style.textDecoration = 'none';
      card.innerHTML = '<i class="fas fa-chart-line"></i><h3>Mick Investment</h3><p>GLOBAL MARKET / THAILAND MARKET / Bond Portfolio</p>';
      quick.appendChild(card);
    }
  };

  init();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
})();