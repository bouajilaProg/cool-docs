const { invoke } = window.__TAURI__.core;

const form = document.getElementById('form');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');

// Store initial settings to detect changes
let initialSettings = null;

async function getSettings() {
  const { language, code_theme } = await invoke('get_settings');
  const languages = await invoke('get_languages');

  initialSettings = { language, code_theme };

  const langSetter = document.getElementById('language');
  const codeThemeSetter = document.getElementById('code-theme');

  langSetter.innerHTML = '';
  const effectiveLanguages = languages.length > 0 ? languages : ['en'];
  effectiveLanguages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang;
    option.textContent = lang.toUpperCase();
    langSetter.appendChild(option);
  });

  langSetter.value = effectiveLanguages.includes(language) ? language : effectiveLanguages[0];
  codeThemeSetter.value = code_theme;

  hideLoading();
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

function showNotification(message, type = 'success') {
  // Create notification element
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  
  notification.textContent = message;
  notification.className = `notification ${type} show`;
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const language = document.getElementById('language').value;
  const codeTheme = document.getElementById('code-theme').value;

  try {
    // Update the storage json through invoking the Tauri command
    await invoke('update_settings', { language, codeTheme });
    
    // Update initial settings to new values
    initialSettings = { language, code_theme: codeTheme };
    
    showNotification('Settings saved successfully!');
  } catch (error) {
    console.error('Error saving settings:', error);
    showNotification('Failed to save settings', 'error');
  }
});

const cancelButton = document.getElementById('cancel-btn');
cancelButton.addEventListener('click', async (e) => {
  e.preventDefault();
  getSettings();
  showNotification('Changes discarded');
});

// Import functionality
if (importBtn && importFile) {
  importBtn.addEventListener('click', () => {
    importFile.click();
  });

  importFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showLoading();
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const content = event.target.result;
        
        if (file.name.endsWith('.json')) {
          // Import JSON data
          await invoke('import_json_data', { jsonContent: content });
          showNotification('Documentation imported successfully!');
        } else if (file.name.endsWith('.zip')) {
          // Import ZIP archive
          const base64 = btoa(
            new Uint8Array(event.target.result)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          await invoke('import_zip_data', { zipBase64: base64 });
          showNotification('Documentation imported successfully!');
        }
        
        hideLoading();
        
        // Optionally reload to show new docs
        setTimeout(() => {
          window.location.href = '/Docs.html';
        }, 1500);
      };
      
      reader.onerror = () => {
        hideLoading();
        showNotification('Failed to read file', 'error');
      };
      
      if (file.name.endsWith('.zip')) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('Import error:', error);
      hideLoading();
      showNotification('Import failed: ' + error.message, 'error');
    }
    
    // Reset file input
    importFile.value = '';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('empty') === '1') {
    showNotification('No documentation found. Import a docs set to get started.', 'error');
  }
  getSettings();
});
