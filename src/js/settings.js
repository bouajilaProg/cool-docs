//on form submit
//get the values from the form
//update the localstorage
//sync the choices with the localstorage
//

const form = document.getElementById('form');

async function getSettings() {
  // Get the settings from rust
  if (settings) {
    document.getElementById('lang').value = settings.lang;
    document.getElementById('category').value = settings.category;
  }
}


form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const lang = document.getElementById('lang').value;
  const category = document.getElementById('category').value;

  // Update the storage json through invoking the Tauri command.
});

document.addEventListener('DOMContentLoaded', () => {
  getSettings();
});
