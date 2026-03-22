const { invoke } = window.__TAURI__.core;

let availableLanguages = [];
let activeLanguage = null;

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function showLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
  }
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

function applyCodeTheme(theme) {
  const codeThemeSetter = document.getElementById('code-theme');
  if (codeThemeSetter) {
    codeThemeSetter.setAttribute('href', `lib/highlightjs/code-theme/${theme}.css`);
  }
}

async function getLanguages() {
  return await invoke('get_languages');
}

async function resolveLanguage() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  const settings = await invoke('get_settings');
  const languages = await getLanguages();

  if (languages.length === 0) {
    return { languages, active: null };
  }

  const preferred = urlLang || settings.language;
  const active = languages.includes(preferred) ? preferred : languages[0];

  return { languages, active };
}

function getCurrentLang() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('lang') || activeLanguage;
}

function hasDocs(registry) {
  if (!Array.isArray(registry)) {
    return false;
  }
  return registry.some(entry => Array.isArray(entry.commands) && entry.commands.length > 0);
}

async function getDocs() {
  const urlParams = new URLSearchParams(window.location.search);
  const lang = getCurrentLang();
  const commandName = urlParams.get('name');
  const categoryName = urlParams.get('category');

  const rootElement = document.getElementById('root');

  if (!lang) {
    if (rootElement) {
      rootElement.innerHTML = '<h1>No documentation found</h1>';
    }
    hideLoading();
    return;
  }

  if (commandName === null || categoryName === null) {
    if (rootElement) {
      rootElement.innerHTML = '<h1>Select a document from the sidebar</h1>';
    }
    hideLoading();
    return;
  }

  if (window.location.pathname !== '/Docs.html') {
    hideLoading();
    return;
  }

  try {
    showLoading();

    const [xmlFile, settings] = await Promise.all([
      invoke('fetch_doc', { lang: lang, category: categoryName, name: commandName }),
      invoke('get_settings')
    ]);

    const doc = new DOMParser().parseFromString(xmlFile, 'text/xml');

    if (doc.querySelector('name') === null) {
      if (rootElement) {
        rootElement.innerHTML = '<h1>Document not found</h1>';
      }
      hideLoading();
      return;
    }

    applyCodeTheme(settings.code_theme);

    let docHtml = String();

    const mainTitle = doc.querySelector('name').textContent;
    const category = doc.querySelector('category').textContent;
    const creator = doc.querySelector('creator').textContent;
    const items = doc.querySelectorAll('item');

    docHtml += `<h1 class="title">${category} / ${mainTitle}</h1>`;
    docHtml += `<p class="creator">${creator}</p>`;
    docHtml += '<div class="spacer"></div>';

    items.forEach(item => {
      for (let i = 0; i < item.children.length; i++) {
        const child = item.children[i];
        if (child.tagName === 'title') {
          docHtml += `<h2 class="item-title">${child.textContent}</h2>`;
        } else if (child.tagName === 'text') {
          docHtml += `<p class="paragraph">${child.textContent}</p>`;
        } else if (child.tagName === 'code') {
          docHtml += `<pre><code>${child.textContent.trim()}</code></pre>`;
        }
      }
      docHtml += '<div class="spacer"></div>';
    });

    if (docHtml === '') {
      docHtml = '<h1>Document not found</h1>';
    }
    if (rootElement) {
      rootElement.innerHTML = docHtml;
    }
    hljs.highlightAll();
  } catch (error) {
    console.error('Error loading document:', error);
    if (rootElement) {
      rootElement.innerHTML = '<h1>Error loading document</h1>';
    }
  } finally {
    hideLoading();
  }
}

async function getRegister(lang) {
  return await invoke('get_registry', { lang });
}

function goTo(link) {
  const [_, lang, category, name] = link.split('/');
  if (window.location.pathname.split('/')[1] !== 'Docs.html') {
    window.location.href = `/Docs.html?lang=${lang}&category=${category}&name=${name.split('.')[0]}`;
  } else {
    showLoading();
    history.pushState({}, '', `/Docs.html?lang=${lang}&category=${category}&name=${name.split('.')[0]}`);
    getDocs();
  }
}

async function updateSide(lang) {
  const register = await getRegister(lang);

  if (!hasDocs(register)) {
    return null;
  }

  const sideBarElement = document.getElementById('side-root');
  if (!sideBarElement) {
    return null;
  }

  let sidebar = '';

  register.forEach(subRegistry => {
    sidebar += `<div class="link-list"><span>${capitalize(subRegistry.list_title)}</span><ul>`;

    subRegistry.commands.forEach(command => {
      const link = `/${lang}/${subRegistry.list_title}/${command}`;
      sidebar += `<li><button class="link-btn" data-link="${link}">${capitalize(command.split('.')[0])}</button></li>`;
    });

    sidebar += '</ul></div>';
  });

  sideBarElement.innerHTML = sidebar;

  const buttons = document.querySelectorAll('.link-btn');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      goTo(button.getAttribute('data-link'));
    });
  });

  return register[0];
}

async function selectLanguage(newLang) {
  activeLanguage = newLang;
  const register = await getRegister(newLang);

  if (!hasDocs(register)) {
    if (window.location.pathname === '/Docs.html') {
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.innerHTML = '<p>No documentation found for this language.</p>';
      }
    }
    hideLoading();
    return;
  }

  await updateSide(newLang);

  const first = register[0];
  const firstName = first.commands[0].split('.')[0];
  const targetUrl = `/Docs.html?lang=${newLang}&category=${first.list_title}&name=${firstName}`;

  if (window.location.pathname === '/Settings.html') {
    window.location.href = targetUrl;
    return;
  }

  history.replaceState({}, '', targetUrl);
  await getDocs();
}

function setupLanguageSwitcher(languages, active) {
  const langSwitcher = document.getElementById('lang-switcher');
  if (!langSwitcher) {
    return;
  }

  langSwitcher.innerHTML = '';

  languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang;
    option.textContent = capitalize(lang);
    langSwitcher.appendChild(option);
  });

  langSwitcher.value = active;
  langSwitcher.onchange = async (event) => {
    const newLang = event.target.value;
    showLoading();
    await selectLanguage(newLang);
  };
}

window.addEventListener('popstate', () => {
  getDocs();
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    showLoading();

    const { languages, active } = await resolveLanguage();
    availableLanguages = languages;
    activeLanguage = active;

    if (window.location.pathname === '/Docs.html' && availableLanguages.length === 0) {
      window.location.replace('/Settings.html?empty=1');
      return;
    }

    if (availableLanguages.length === 0) {
      hideLoading();
      return;
    }

    setupLanguageSwitcher(availableLanguages, activeLanguage);

    const firstSubRegister = await updateSide(activeLanguage);

    if (window.location.pathname === '/Settings.html') {
      hideLoading();
      return;
    }

    if (firstSubRegister === undefined || firstSubRegister === null) {
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.innerHTML = '<p>No documentation found. Import documentation in Settings.</p>';
      }
      hideLoading();
      return;
    }

    const lang = getCurrentLang() || activeLanguage;

    const settingsButton = document.getElementById('settings-btn');
    if (settingsButton) {
      settingsButton.setAttribute('href', `/Settings.html?lang=${lang}`);
    }

    if (!window.location.search.includes('name')) {
      history.replaceState({}, '', `/Docs.html?lang=${lang}&category=${firstSubRegister.list_title}&name=${firstSubRegister.commands[0].split('.')[0]}`);
    }

    await getDocs();
  } catch (error) {
    console.error('Error during initialization:', error);
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = '<p>Error loading documentation. Please check your data files.</p>';
    }
    hideLoading();
  }
});
