/* MORRUBARBER - 3-STEP BOOKING SYSTEM LOGIC */

let selectedBooking = {
    service: '',
    price: '',
    barber: '',
    date: '',
    hour: '',
    time: ''
};

const availableHours = [
    "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30",
    "19:00", "19:30", "20:00", "20:30"
];

// Configurar fecha mínima (hoy) y renderizar botones al cargar
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
    renderTimeButtons();
});

function renderTimeButtons() {
    const container = document.getElementById('time-slots-container');
    if (!container) return;

    container.innerHTML = availableHours.map(hour => `
        <button 
            type="button" 
            class="time-slot-btn" 
            data-hour="${hour}"
            onclick="selectHour('${hour}')"
            style="padding: 0.65rem; background: var(--bg-card); color: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; transition: all 0.2s;">
            ${hour} hs
        </button>
    `).join('');
}

function selectService(serviceName, price) {
    selectedBooking.service = serviceName;
    selectedBooking.price = price;
    goToStep(2);
}

function selectHour(hour) {
    selectedBooking.hour = hour;

    // Resaltar botón seleccionado
    document.querySelectorAll('.time-slot-btn').forEach(btn => {
        if (btn.dataset.hour === hour) {
            btn.style.background = 'var(--accent-gold)';
            btn.style.color = '#000';
            btn.style.borderColor = 'var(--accent-gold)';
        } else {
            btn.style.background = 'var(--bg-card)';
            btn.style.color = '#fff';
            btn.style.borderColor = 'var(--border-color)';
        }
    });

    validateStep2();
}

function validateStep2() {
    const dateInput = document.getElementById('booking-date');
    const nextBtn = document.getElementById('btn-to-step-3');
    const errorMsg = document.getElementById('step-2-error');

    selectedBooking.date = dateInput ? dateInput.value : '';
    const isValid = Boolean(selectedBooking.date && selectedBooking.hour);

    if (nextBtn) {
        nextBtn.disabled = !isValid;
        nextBtn.style.opacity = isValid ? '1' : '0.5';
        nextBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
    }

    if (isValid && errorMsg) {
        errorMsg.style.display = 'none';
    }

    return isValid;
}

function goToStep(stepNumber) {
    // Bloquear avance al paso 3 si falta día u horario
    if (stepNumber === 3 && !validateStep2()) {
        const errorMsg = document.getElementById('step-2-error');
        if (errorMsg) errorMsg.style.display = 'block';
        return;
    }

    document.querySelectorAll('.booking-step').forEach(step => step.style.display = 'none');
    document.getElementById(`step-${stepNumber}`).style.display = 'block';

    // Actualizar indicadores
    for (let i = 1; i <= 3; i++) {
        const ind = document.getElementById(`step-${i}-indicator`);
        if (i === stepNumber) {
            ind.style.background = 'var(--accent-gold)';
            ind.style.color = '#000';
        } else {
            ind.style.background = 'rgba(212, 175, 55, 0.15)';
            ind.style.color = 'var(--accent-gold)';
        }
    }

    if (stepNumber === 3) {
        const [year, month, day] = selectedBooking.date.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        selectedBooking.time = `${formattedDate} a las ${selectedBooking.hour} hs`;

        document.getElementById('booking-summary').innerText = 
            `Servicio: ${selectedBooking.service} | Turno: ${selectedBooking.time}`;
    }
}

function confirmBooking(event) {
    event.preventDefault();
    alert(`¡Reserva confirmada con éxito!\n\nServicio: ${selectedBooking.service}\nFecha y hora: ${selectedBooking.time}\n\nEn breve recibirás un recordatorio por mail.`);
    
    // Resetear estado
    selectedBooking = { service: '', price: '', barber: '', date: '', hour: '', time: '' };
    const dateInput = document.getElementById('booking-date');
    if (dateInput) dateInput.value = '';
    renderTimeButtons();
    validateStep2();
    goToStep(1);
}