const { invoke } = window.__TAURI__.core;
//on form submit
//get the values from the form
//update the localstorage
//sync the choices with the localstorage
//
const form = document.getElementById('form');

async function getSettings() {
  // Get the settings from rust
  const { language, code_theme } = await invoke('get_settings');


  const langSetter = document.getElementById('language');
  const codeThemeSetter = document.getElementById('code-theme');

  langSetter.value = language;
  codeThemeSetter.value = code_theme;

}

alert(form)

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const language = document.getElementById('language').value;
  const codeTheme = document.getElementById('code-theme').value;
  alert("Language: " + language + " Code Theme: " + codeTheme);



  // Update the storage json through invoking the Tauri command.
  await invoke('update_settings', { language, codeTheme });
  alert('Settings updated');
});

document.addEventListener('DOMContentLoaded', () => {
  getSettings();
});
