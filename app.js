
const screens = document.querySelectorAll('.screen');
const navButtons = document.querySelectorAll('[data-go]');
const dateLine = document.getElementById('dateLine');

const formatDate = new Intl.DateTimeFormat('en-US', {
  weekday:'long', month:'long', day:'numeric'
});
dateLine.textContent = formatDate.format(new Date());

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.go;
    screens.forEach(s => s.classList.toggle('active', s.dataset.screen === target));
    navButtons.forEach(n => n.classList.toggle('active', n.dataset.go === target));
  });
});

const quickAddDialog = document.getElementById('quickAddDialog');
const quickAddOpen = document.getElementById('quickAddOpen');
const quickAddText = document.getElementById('quickAddText');
const savedNote = document.getElementById('savedNote');
let quickType = 'Inbox';

quickAddOpen.addEventListener('click', () => {
  savedNote.textContent = '';
  quickAddDialog.showModal();
  setTimeout(()=>quickAddText.focus(), 100);
});

document.querySelectorAll('[data-type]').forEach(pill => {
  pill.addEventListener('click', () => {
    quickType = pill.dataset.type;
    document.querySelectorAll('[data-type]').forEach(p => p.classList.toggle('selected', p === pill));
    document.getElementById('saveQuickAdd').textContent = `Save to ${quickType}`;
  });
});

document.getElementById('saveQuickAdd').addEventListener('click', (e) => {
  e.preventDefault();
  const text = quickAddText.value.trim();
  if (!text) {
    savedNote.textContent = 'Type something first.';
    return;
  }
  const items = JSON.parse(localStorage.getItem('gathered_inbox') || '[]');
  items.unshift({text, type: quickType, createdAt: new Date().toISOString()});
  localStorage.setItem('gathered_inbox', JSON.stringify(items));
  savedNote.textContent = 'Saved.';
  quickAddText.value = '';
  setTimeout(()=>quickAddDialog.close(), 550);
});

const simplifyDialog = document.getElementById('simplifyDialog');
document.getElementById('simplifyBtn').addEventListener('click', ()=>simplifyDialog.showModal());

document.querySelectorAll('[data-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('selected', b === btn));
    const mode = btn.dataset.mode;
    localStorage.setItem('gathered_mode', mode);
    const msg = document.getElementById('modeMessage');
    const messages = {
      'Normal':'Your full Today view is active.',
      'Busy':'Gathered will keep only the most important items visible.',
      'Low Energy':'Today will focus on essentials and quietly move the rest.',
      'Sick':'Only true essentials should stay in view today.',
      'Outing':'Gathered will prioritize what needs to happen before and after you leave.'
    };
    msg.textContent = messages[mode];
  });
});

document.getElementById('changeAnchorBtn').addEventListener('click', () => {
  const next = prompt('What is the one thing you want to anchor today around?', document.getElementById('anchorText').textContent);
  if (next && next.trim()) {
    document.getElementById('anchorText').textContent = next.trim();
    localStorage.setItem('gathered_anchor', next.trim());
  }
});

const savedAnchor = localStorage.getItem('gathered_anchor');
if (savedAnchor) document.getElementById('anchorText').textContent = savedAnchor;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}


// --- Gathered: 10-Minute Reset feature ---
(function addTenMinuteReset() {
  const heroCard = document.querySelector('.hero-card');
  if (!heroCard) return;

  // Add a visible button to the Today's Anchor card
  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.id = 'tenMinuteResetBtn';
  resetBtn.textContent = 'Start a 10-minute reset';
  resetBtn.style.marginTop = '14px';
  resetBtn.style.width = '100%';
  resetBtn.style.border = '0';
  resetBtn.style.borderRadius = '16px';
  resetBtn.style.padding = '13px 14px';
  resetBtn.style.background = '#6F7A67';
  resetBtn.style.color = '#fff';
  resetBtn.style.fontWeight = '800';
  resetBtn.style.cursor = 'pointer';
  heroCard.appendChild(resetBtn);

  // Build the reset dialog entirely in JS so only app.js needs replacing
  const dialog = document.createElement('dialog');
  dialog.id = 'resetDialog';
  dialog.innerHTML = `
    <form method="dialog" style="
      background:#FBF8F2;
      border:1px solid #DED7CC;
      border-radius:26px;
      padding:20px;
      box-shadow:0 8px 24px rgba(67,57,45,.12);
    ">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
        <div>
          <div style="font-size:11px;letter-spacing:.17em;font-weight:800;color:#6F7A67;">10-MINUTE RESET</div>
          <h2 style="font-family:Georgia,'Times New Roman',serif;margin:5px 0 6px;font-size:26px;">Just enough for now.</h2>
          <p style="margin:0 0 14px;color:#75786F;font-size:14px;line-height:1.45;">Pick up what you can. You do not have to finish the house.</p>
        </div>
        <button value="cancel" aria-label="Close" style="border:0;background:transparent;font-size:28px;line-height:1;">×</button>
      </div>

      <div id="resetChecklist" style="display:grid;gap:2px;margin:10px 0 16px;">
        ${[
          'Gather dishes and cups',
          'Put away obvious clutter',
          'Start one load of laundry',
          'Wipe kitchen counters',
          'Reset the living room'
        ].map((item, i) => `
          <label style="display:flex;gap:11px;align-items:center;padding:11px 2px;border-bottom:1px solid #EAE4DA;font-size:15px;">
            <input type="checkbox" data-reset-item="${i}" style="width:19px;height:19px;accent-color:#6F7A67;">
            <span>${item}</span>
          </label>
        `).join('')}
      </div>

      <button type="button" id="clearResetBtn" style="
        width:100%;
        border:1px solid #DED7CC;
        border-radius:16px;
        padding:12px;
        background:#fff;
        color:#6F7A67;
        font-weight:800;
      ">Start fresh</button>

      <p id="resetEncouragement" style="text-align:center;color:#75786F;font-size:12px;margin:12px 0 0;"></p>
    </form>
  `;
  document.body.appendChild(dialog);

  const boxes = [...dialog.querySelectorAll('[data-reset-item]')];
  const encouragement = dialog.querySelector('#resetEncouragement');

  function loadState() {
    const state = JSON.parse(localStorage.getItem('gathered_reset_state') || '{}');
    boxes.forEach(box => {
      box.checked = !!state[box.dataset.resetItem];
    });
    updateMessage();
  }

  function saveState() {
    const state = {};
    boxes.forEach(box => state[box.dataset.resetItem] = box.checked);
    localStorage.setItem('gathered_reset_state', JSON.stringify(state));
    updateMessage();
  }

  function updateMessage() {
    const done = boxes.filter(b => b.checked).length;
    if (done === 0) encouragement.textContent = 'One thing is enough to begin.';
    else if (done < boxes.length) encouragement.textContent = `${done} of ${boxes.length} done. Keep it gentle.`;
    else encouragement.textContent = 'Done for now. That counts. 🌿';
  }

  boxes.forEach(box => box.addEventListener('change', saveState));

  dialog.querySelector('#clearResetBtn').addEventListener('click', () => {
    boxes.forEach(box => box.checked = false);
    localStorage.removeItem('gathered_reset_state');
    updateMessage();
  });

  resetBtn.addEventListener('click', () => {
    loadState();
    dialog.showModal();
  });
})();
