/* MORCUTZ - 3-STEP BOOKING SYSTEM LOGIC (GOOGLE FORMS) */

const MORCUTZ_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf9VLyiL1Sfq_ZvykBxyGWZvhOh2zWuFusIlfhipTycmvS29w/formResponse";

const MORCUTZ_ENTRIES = {
    servicio: "entry.1971089914",
    dia: "entry.450570363",
    horario: "entry.1936375404",
    nombre: "entry.688348781",
    email: "entry.1395332125"
};

let selectedBooking = {
    service: '',
    price: '',
    barber: 'Morcutz',
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

    if (dateInput && dateInput.value) {
        selectedBooking.date = dateInput.value;
    } else if (!selectedBooking.date) {
        const legacyTimeInput = document.getElementById('booking-time');
        if (legacyTimeInput && legacyTimeInput.value) {
            const parsedDate = new Date(legacyTimeInput.value);
            if (!Number.isNaN(parsedDate.getTime())) {
                selectedBooking.date = parsedDate.toISOString().split('T')[0];
                if (!selectedBooking.hour) {
                    const hh = String(parsedDate.getHours()).padStart(2, '0');
                    const mm = String(parsedDate.getMinutes()).padStart(2, '0');
                    selectedBooking.hour = `${hh}:${mm}`;
                }
            }
        }
    }

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
    if (stepNumber === 3 && !validateStep2()) {
        const errorMsg = document.getElementById('step-2-error');
        if (errorMsg) errorMsg.style.display = 'block';
        return;
    }

    document.querySelectorAll('.booking-step').forEach(step => step.style.display = 'none');
    const targetStep = document.getElementById(`step-${stepNumber}`);
    if (targetStep) targetStep.style.display = 'block';

    for (let i = 1; i <= 3; i++) {
        const ind = document.getElementById(`step-${i}-indicator`);
        if (!ind) continue;
        if (i === stepNumber) {
            ind.style.background = 'var(--accent-gold)';
            ind.style.color = '#000';
        } else {
            ind.style.background = 'rgba(212, 175, 55, 0.15)';
            ind.style.color = 'var(--accent-gold)';
        }
    }

    if (stepNumber === 3) {
        let formattedDate = selectedBooking.date;
        if (selectedBooking.date && selectedBooking.date.includes('-')) {
            const [year, month, day] = selectedBooking.date.split('-');
            formattedDate = `${day}/${month}/${year}`;
        }
        selectedBooking.time = `${formattedDate} a las ${selectedBooking.hour} hs`;

        const summaryEl = document.getElementById('booking-summary');
        if (summaryEl) {
            const priceText = selectedBooking.price ? ` (${selectedBooking.price})` : '';
            summaryEl.innerText = `Servicio: ${selectedBooking.service}${priceText} | Horario: ${selectedBooking.time}`;
        }
    }
}

async function confirmBooking(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    const nameInput = document.getElementById('client-name');
    const emailInput = document.getElementById('client-email');

    const clientName = nameInput ? nameInput.value.trim() : '';
    const clientEmail = emailInput ? emailInput.value.trim() : '';

    if (!selectedBooking.service || !selectedBooking.date || !selectedBooking.hour) {
        alert("Por favor, seleccioná un servicio, un día y un horario antes de confirmar.");
        goToStep(1);
        return;
    }

    const params = new URLSearchParams();
    params.append(MORCUTZ_ENTRIES.servicio, selectedBooking.service);
    params.append(MORCUTZ_ENTRIES.dia, selectedBooking.date);
    params.append(MORCUTZ_ENTRIES.horario, `${selectedBooking.hour} hs`);
    params.append(MORCUTZ_ENTRIES.nombre, clientName);
    params.append(MORCUTZ_ENTRIES.email, clientEmail);

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "ENVIANDO RESERVA...";
    }

    try {
        await fetch(MORCUTZ_FORM_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString()
        });

        let formattedDate = selectedBooking.date;
        if (selectedBooking.date.includes('-')) {
            const [year, month, day] = selectedBooking.date.split('-');
            formattedDate = `${day}/${month}/${year}`;
        }

        alert(
            `¡Reserva confirmada con éxito en MORCUTZ!\n\n` +
            `Cliente: ${clientName || "Cliente"}\n` +
            `Servicio: ${selectedBooking.service}\n` +
            `Día y hora: ${formattedDate} a las ${selectedBooking.hour} hs`
        );

        selectedBooking = { service: '', price: '', barber: 'Morcutz', date: '', hour: '', time: '' };
        const dateInput = document.getElementById('booking-date');
        if (dateInput) dateInput.value = '';
        if (form) form.reset();
        renderTimeButtons();
        validateStep2();
        goToStep(1);
    } catch (error) {
        console.error("Error al enviar reserva de Morcutz:", error);
        alert("Hubo un problema al registrar tu turno. Por favor, intentá nuevamente.");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "CONFIRMAR TURNO";
        }
    }
}
