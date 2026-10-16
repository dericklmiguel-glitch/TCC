import { apiFetch } from '../services/api.js';

let currentDate = new Date();
let selectedDateStr = '';
let selectedColor = 'yellow';
let eventsList = [];

export function initCalendarioView() {
  setupCalendarEvents();
  loadCalendario();
}

export async function loadCalendario() {
  try {
    const data = await apiFetch('/calendario');
    eventsList = Array.isArray(data) ? data : [];
  } catch (err) {
    eventsList = [];
  }
  renderBoard();
}

function setupCalendarEvents() {
  const prevBtn = document.getElementById('cal-prev-month');
  const nextBtn = document.getElementById('cal-next-month');
  const modalForm = document.getElementById('cal-modal-form');
  const cancelBtn = document.getElementById('btn-cancel-modal');
  const colorOpts = document.querySelectorAll('.color-option');

  if (prevBtn) {
    prevBtn.onclick = () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderBoard();
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderBoard();
    };
  }

  colorOpts.forEach(opt => {
    opt.onclick = () => {
      colorOpts.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedColor = opt.getAttribute('data-color') || 'yellow';
    };
  });

  if (cancelBtn) {
    cancelBtn.onclick = () => closeModal();
  }

  if (modalForm) {
    modalForm.onsubmit = async (e) => {
      e.preventDefault();
      const input = document.getElementById('modal-note-title');
      const errorEl = document.getElementById('modal-error-msg');
      const titulo = input ? input.value.trim() : '';

      if (errorEl) errorEl.textContent = '';

      if (!titulo || !selectedDateStr) return;

      try {
        const res = await apiFetch('/calendario', {
          method: 'POST',
          body: JSON.stringify({
            data: selectedDateStr,
            titulo: titulo,
            cor: selectedColor
          })
        });

        if (res && !res.error) {
          if (input) input.value = '';
          closeModal();
          await loadCalendario();
        } else {
          if (errorEl) errorEl.textContent = res?.error || 'Erro ao guardar a anotação.';
        }
      } catch (err) {
        if (errorEl) errorEl.textContent = 'Não foi possível conectar ao servidor backend.';
      }
    };
  }

  window.deleteCalNote = async (e, id) => {
    e.stopPropagation();
    const res = await apiFetch(`/calendario/${id}`, { method: 'DELETE' });
    if (res && !res.error) {
      await loadCalendario();
    }
  };
}

function renderBoard() {
  const monthNameEl = document.getElementById('cal-month-name');
  const boardEl = document.getElementById('cal-grid-board');
  if (!monthNameEl || !boardEl) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  monthNameEl.textContent = `${monthNames[month]} ${year}`;

  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  let html = '';

  for (let i = 0; i < firstDayIndex; i++) {
    html += `<div class="cal-day-cell empty-cell"></div>`;
  }

  for (let day = 1; day <= lastDate; day++) {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const dayNotes = eventsList.filter(e => e.data === dateStr);

    const postitsHtml = dayNotes.map(n => `
      <div class="postit-card postit-${n.cor || 'yellow'}">
        <span>${escapeHtml(n.titulo)}</span>
        <button onclick="window.deleteCalNote(event, '${n.id}')">✕</button>
      </div>
    `).join('');

    html += `
      <div class="cal-day-cell" data-date="${dateStr}">
        <div class="cal-day-num">${day}</div>
        ${postitsHtml}
      </div>
    `;
  }

  boardEl.innerHTML = html;

  const dayCells = boardEl.querySelectorAll('.cal-day-cell:not(.empty-cell)');
  dayCells.forEach(cell => {
    cell.onclick = () => {
      selectedDateStr = cell.getAttribute('data-date');
      openModal(selectedDateStr);
    };
  });
}

function openModal(dateStr) {
  const modal = document.getElementById('cal-modal');
  const label = document.getElementById('modal-date-label');
  const errorEl = document.getElementById('modal-error-msg');

  if (errorEl) errorEl.textContent = '';
  if (label) {
    const [y, m, d] = dateStr.split('-');
    label.textContent = `${d}/${m}/${y}`;
  }
  if (modal) modal.classList.remove('hidden');
}

function closeModal() {
  const modal = document.getElementById('cal-modal');
  if (modal) modal.classList.add('hidden');
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}