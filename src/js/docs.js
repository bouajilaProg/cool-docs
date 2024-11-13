
const { invoke } = window.__TAURI__.core;


async function getDocs() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const lang = urlParams.get('lang');
  const commandName = urlParams.get('name');
  const categoryName = urlParams.get('category');

  const rootElement = document.getElementById('root');


  //fn fetch_doc(lang: String, category: String, name: String) -> String {
  const xmlFile = await invoke('fetch_doc', { lang: lang, category: categoryName, name: commandName });
  const doc = new DOMParser().parseFromString(xmlFile, "text/xml");


  let docHtml = String();


  const mainTitle = doc.querySelector('name').textContent;


  const category = doc.querySelector('category').textContent;

  const creator = doc.querySelector('creator').textContent;
  const items = doc.querySelectorAll('item');


  docHtml += `<h1 class="title">${category} / ${mainTitle}</h1>`;
  docHtml += `<p class="creator">${creator}</p>`;
  docHtml += `<div class="spacer"></div>`;



  items.forEach(item => {
    //loop around children
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
    docHtml += `<div class="spacer"></div>`;

  });

  rootElement.innerHTML = docHtml;
  hljs.highlightAll();


}

