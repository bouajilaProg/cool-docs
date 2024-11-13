const { invoke } = window.__TAURI__.core;


function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

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

  if (doc.querySelector('name') === null) {
    rootElement.innerHTML = "<h1>Not found</h1>";
    return;
  }

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

  if (docHtml === "") {
    docHtml = "<h1>Not found</h1>";
  }
  rootElement.innerHTML = docHtml;
  hljs.highlightAll();
}

async function getRegister() {
  return await invoke("get_registry", { lang: "cpp" });
}

function goTo(link) {
  const category = link.split("/")[2];
  const name = link.split("/")[3].split(".")[0];
  if (window.location.pathname.split("/")[1] !== "Docs.html") {
    window.location.href = `/Docs.html?lang=cpp&category=${category}&name=${name}`;
  } else {
    history.pushState({}, "", `/Docs.html?lang=cpp&category=${category}&name=${name}`);
    getDocs();
  }
}

async function updateSide() {
  const register = await getRegister();
  const sideBarElement = document.getElementById('side-root');
  if (!sideBarElement) {
    return; // If the sidebar element doesn't exist, do nothing
  }

  let sidebar = "";

  //could've used d but i did this first and it worked so i didn't bother changing it
  register.forEach(subRegistry => {
    sidebar += ` <div class="link-list"> <span>${capitalize(subRegistry.list_title)}</span> <ul>`;

    subRegistry.commands.forEach(command => {
      const link = `/cpp/${subRegistry.list_title}/${command}`;
      sidebar += `<li><button data-link="${link}">${capitalize(command.split(".")[0])}</button></li>`;
    });

    sidebar += `</ul> </div>`;
  });

  sideBarElement.innerHTML = sidebar;

  const buttons = document.querySelectorAll("button");
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      goTo(button.getAttribute("data-link"));
    });
  });

  return register[0];
}


document.addEventListener("DOMContentLoaded", async () => {  // Use async function to await updateSide()
  try {
    const firstSubRegister = await updateSide();  // Await updateSide() since it's asynchronous
    if (window.location.search.includes("name")) {
      getDocs();
    } else {
      history.pushState({}, "", `/Docs.html?lang=cpp&category=${firstSubRegister.list_title}&name=${firstSubRegister.commands[0].split(".")[0]}`);  // Push the URL to history
      getDocs();
    }
  } catch (error) {
    alert("Error during initialization: " + error);  // Alert error message if there's an issue
  }
});

