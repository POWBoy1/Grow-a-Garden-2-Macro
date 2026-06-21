let cachedData = null;





async function onSaveClick() {
  const cfg = {
    username: document.getElementById('username').value,
    itemcount: document.getElementById('itemcount').value,
  };

  ahk.Save.Func(JSON.stringify(cfg));
  console.log("Config Saved:", cfg);
}
  
function applySettings(payload) {
  const settings = payload.data;
  console.log("Applying incoming configurations:", settings);

  const fieldMap = {
    'username': settings.username,
    'itemcount': settings.itemcount,
  };

  Object.entries(fieldMap).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) {
      if (el.type === 'checkbox' || el.type === 'radio') el.checked = value;
      else el.value = value;
    }
  });

  handleThemeChange();

  onSaveClick();

}







document.addEventListener("DOMContentLoaded", async () => {
  ahk.ReadSettings.Func();
  window.chrome.webview.addEventListener('message', applySettings);

  initTooltipSystem();
  initDropdownControllers();

  document.querySelectorAll('.tabs button').forEach(button => {
    button.addEventListener('click', function() {
      document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('tab-button-active'));
      this.classList.add('tab-button-active');
    });
  });


  document.querySelectorAll(".SelectAll").forEach(selectAllCheckbox => {
    selectAllCheckbox.addEventListener("change", () => {
      const rewardGrid = selectAllCheckbox.closest(".rewards-grid");
      if (!rewardGrid) return;

      rewardGrid.querySelectorAll("input[type='checkbox']").forEach(cb => {
        const isControl = cb.classList.contains("SelectAll") || CATEGORIES.includes(cb.id);
        if (!isControl) {
          cb.checked = selectAllCheckbox.checked;
        }
      });

      onSaveClick();
    });
  });

  const container = document.querySelector('.container');
  if (container) {
    container.addEventListener('change', (event) => {
      const target = event.target;
      if (target.matches('input[type="checkbox"], input[type="text"], input[type="radio"]')) {
        console.log(`Auto-saving layout state change on: #${target.id || 'Dynamic Entry'}`);
        onSaveClick();
      }
    });
  }


});























// Some Fancy GUI stuff




const themeToggle = document.getElementById('ThemeToggle');
if (themeToggle) {

  handleThemeChange(); 
  
  themeToggle.addEventListener('change', handleThemeChange);
}

function handleThemeChange() {
  const themeToggle = document.getElementById('ThemeToggle');
  if (themeToggle && themeToggle.checked) {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
};










function initTooltipSystem() {
  document.querySelectorAll('.info-tooltip-holder').forEach(holder => {
    const box = holder.querySelector('.tooltip-box');
    let hideTimeout;

    holder.addEventListener('mouseenter', () => {
      clearTimeout(hideTimeout);
      holder.classList.remove('left-snap', 'right-snap', 'top-snap', 'bottom-snap');

      const rect = holder.getBoundingClientRect();
      const container = holder.closest('.sidebar-content-view') || holder.closest('.tab');
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();

      // Horizontal checking
      if ((rect.left - 110) < containerRect.left) holder.classList.add('left-snap');
      else if ((rect.right + 110) > containerRect.right) holder.classList.add('right-snap');

      // Vertical checking
      if ((rect.top - 55) < containerRect.top) holder.classList.add('top-snap');
      else if ((rect.bottom + 55) > containerRect.bottom) holder.classList.add('bottom-snap');

      if (box) box.classList.add('visible');
    });

    holder.addEventListener('mouseleave', () => {
      hideTimeout = setTimeout(() => {
        if (box) box.classList.remove('visible');
        holder.classList.remove('left-snap', 'right-snap', 'top-snap', 'bottom-snap');
      }, 200);
    });
  });
}

function initDropdownControllers() {
  document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
    const selected = dropdown.querySelector('.custom-dropdown-selected');
    const options = dropdown.querySelector('.custom-dropdown-options');
    const hiddenInput = document.getElementById('hiddenSelector');

    selected.addEventListener('click', () => {
      options.style.display = options.style.display === 'block' ? 'none' : 'block';
    });

    options.querySelectorAll('[data-value]').forEach(option => {
      option.addEventListener('click', () => {
        const value = option.getAttribute('data-value');
        selected.textContent = option.textContent.trim();
        if (hiddenInput) hiddenInput.value = value;
        options.style.display = 'none';
      });
    });

    document.addEventListener('click', e => {
      if (!dropdown.contains(e.target)) options.style.display = 'none';
    });
  });
}






