
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
