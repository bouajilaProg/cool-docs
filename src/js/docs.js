const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const lang = urlParams.get('lang');
const name = urlParams.get('name');

const doc = new DOMParser().parseFromString(`
<document>
  <name>test</name>
  <category>test</category>
  <creator>testUser</creator>
  <content>
    <item>
      <title>test</title>
      <text>test description</text>
      <code>test code</code>
    </item>
    <item>
      <title>test</title>
      <text>test description</text>
      <code>test code</code>
      <text>test description 2</text>
    </item>
    <item>
      <title>test</title>
      <text>test description</text>
      <code>test code</code>
      <code>test code 2</code>
    </item>
  </content>
</document>
`, "text/xml");

const mainTitle = doc.querySelector('name').textContent;
const category = doc.querySelector('category').textContent;
const creator = doc.querySelector('creator').textContent;
const items = doc.querySelectorAll('item');

const rootElement = document.getElementById('root');

// Title
const titleElement = document.createElement('h1');
titleElement.textContent = category + " / " + mainTitle;
titleElement.className = 'title';
rootElement.appendChild(titleElement);

// creator
const creatorElement = document.createElement('p');
creatorElement.textContent = creator;
creatorElement.className = 'creator';
rootElement.appendChild(creatorElement);

const spacer = document.createElement('div');
spacer.className = 'spacer';
rootElement.appendChild(spacer);


// Items
items.forEach(item => {
  //loop around children
  for (let i = 0; i < item.children.length; i++) {
    const child = item.children[i];
    if (child.tagName === 'title') {
      const titleElement = document.createElement('h2');
      titleElement.textContent = child.textContent;
      titleElement.className = 'item-title';

      rootElement.appendChild(titleElement);

    } else if (child.tagName === 'text') {
      const textElement = document.createElement('p');
      textElement.textContent = child.textContent;
      textElement.className = 'paragraph';
      rootElement.appendChild(textElement);

    } else if (child.tagName === 'code') {
      const codeElement = document.createElement('code');
      codeElement.textContent = child.textContent;
      const preElement = document.createElement('pre');
      preElement.appendChild(codeElement);
      rootElement.appendChild(preElement);

    }

  }
  const spacer = document.createElement('div');
  spacer.className = 'spacer';
  rootElement.appendChild(spacer);


})
