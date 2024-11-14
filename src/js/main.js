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

  console.log(lang, categoryName, commandName);

  const rootElement = document.getElementById('root');

  if (lang === null || commandName === null || categoryName === null) {
    rootElement.innerHTML = "<h1>Not found</h1>";
    return;
  }

  if (window.location.pathname !== "/Docs.html") {
    return;
  }


  //fn fetch_doc(lang: String, category: String, name: String) -> String {
  const xmlFile = await invoke('fetch_doc', { lang: lang, category: categoryName, name: commandName });
  const doc = new DOMParser().parseFromString(xmlFile, "text/xml");

  if (doc.querySelector('name') === null) {
    rootElement.innerHTML = "<h1>Not found</h1>";
    return;
  }

  //fetch the settings
  const { language, code_theme } = await invoke('get_settings');
  const codeThemeSetter = document.getElementById('code-theme');
  codeThemeSetter.setAttribute("href", `lib/highlightjs/code-theme/${code_theme}.css`);

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
  let lang = "cpp";
  if (window.location.search.includes("lang")) {
    lang = window.location.search.split("&")[0].split("=")[1];
  }


  return await invoke("get_registry", { lang });
}

function goTo(link) {
  const [_, lang, category, name] = link.split("/");
  if (window.location.pathname.split("/")[1] !== "Docs.html") {
    console.log("redirecting");
    window.location.href = `/Docs.html?lang=${lang}&category=${category}&name=${name.split(".")[0]} `;
  } else {
    history.pushState({}, "", `/Docs.html?lang=${lang}&category=${category}&name=${name.split(".")[0]}`);

    console.log("pushing");
    getDocs();
  }
}

async function updateSide() {
  const register = await getRegister();

  if (register.length === 0) {
    return; // If the register is empty, do nothing
  }
  const sideBarElement = document.getElementById('side-root');
  if (!sideBarElement) {
    return; // If the sidebar element doesn't exist, do nothing
  }

  let sidebar = "";

  console.log(register);
  //could've used d but i did this first and it worked so i didn't bother changing it
  register.forEach(subRegistry => {
    sidebar += ` <div class= "link-list" > <span>${capitalize(subRegistry.list_title)}</span> <ul>`;

    subRegistry.commands.forEach(command => {
      const link = `/cpp/${subRegistry.list_title}/${command}`;
      sidebar += `<li><button class="link-btn" data-link="${link}">${capitalize(command.split(".")[0])}</button></li>`;
    });

    sidebar += `</ul> </div > `;
  });

  sideBarElement.innerHTML = sidebar;



  const buttons = document.querySelectorAll(".link-btn");
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      goTo(button.getAttribute("data-link"));
    });
  });

  return register[0];
}


document.addEventListener("DOMContentLoaded", async () => {  // Use async function to await updateSide()
  try {
    const firstSubRegister = await updateSide();

    if (window.location.pathname === "/Settings.html") {
      return;
    }

    if (firstSubRegister === undefined || firstSubRegister === null) {
      const rootElement = document.getElementById('root');
      rootElement.innerHTML = "<p>no doc was found for this language</p>";

      return;
    }
    const lang = window.location.search.split("&")[0].split("=")[1];

    // update the settings button href
    const settingsButton = document.getElementById("settings-btn");
    settingsButton.setAttribute("href", `/Settings.html?lang=${lang}`);

    // if first time loading the page, redirect to the first command
    if (window.location.search.includes("name") == false) {
      window.location.href = `/Docs.html?lang=${lang}&category=${firstSubRegister.list_title}&name=${firstSubRegister.commands[0].split(".")[0]} `
    }
    getDocs();  // Call getDocs() to get the documentation
  } catch (error) {
    alert("Error during initialization: " + error);  // Alert error message if there's an issue
  }
});

