/* MORCUTZ - Reserva con calendario visual y horarios establecidos */

const selectedBooking = {
    service: "",
    price: "$XX",
    barber: "",
    date: "",
    time: ""
};

const bookingSchedule = {
    "Mañana": ["11:00", "11:40"],
    "Tarde": ["12:20", "13:00", "13:40", "14:20", "15:00", "15:40", "16:20"],
    "Noche": ["17:00", "17:40", "18:20", "19:00", "19:40", "20:20"]
};

let calendarOffset = 0;

function localDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function selectService(serviceName, price) {
    selectedBooking.service = serviceName;
    selectedBooking.price = price;
    document.getElementById("order-service-name").textContent = serviceName;
    document.getElementById("order-service-price").textContent = price;
    document.getElementById("order-total").textContent = price;
    document.getElementById("order-service-duration").textContent =
        serviceName.toLowerCase().includes("full") ? "60 min" : "45 min";
    calendarOffset = 0;
    renderCalendar();
    goToStep(2);
}

function selectBarber(barberName) {
    selectedBooking.barber = barberName;
    document.querySelectorAll(".barber-option").forEach(button => {
        const active = button.textContent.trim() === (barberName.includes("Mora") ? 'Tomás "Mora"' : "Lucas");
        button.classList.toggle("selected", active);
        button.setAttribute("aria-pressed", String(active));
    });
}

function renderCalendar() {
    const container = document.getElementById("calendar-days");
    const monthLabel = document.getElementById("booking-month-label");
    if (!container || !monthLabel) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() + calendarOffset * 6);

    monthLabel.textContent = start.toLocaleDateString("es-AR", {
        month: "long",
        year: "numeric"
    });

    const dates = Array.from({ length: 6 }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        return date;
    });

    container.innerHTML = dates.map(date => {
        const value = localDateString(date);
        const dayName = date.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "");
        const isPast = date < today;
        const isSunday = date.getDay() === 0;
        const isSelected = selectedBooking.date === value;
        return `
            <button type="button"
                class="calendar-day ${isSelected ? "selected" : ""} ${isPast || isSunday ? "disabled" : ""}"
                data-date="${value}"
                ${isPast || isSunday ? "disabled" : ""}
                onclick="selectDate('${value}')">
                <span class="calendar-day-number">${date.getDate()}</span>
                <span class="calendar-day-name">${dayName}</span>
            </button>
        `;
    }).join("");

    document.getElementById("calendar-prev").disabled = calendarOffset === 0;
    document.getElementById("calendar-next").disabled = false;
}

function selectDate(dateValue) {
    selectedBooking.date = dateValue;
    selectedBooking.time = "";
    renderCalendar();
    renderTimeSlots();
    updateOrderSummary();
}

function renderTimeSlots() {
    const container = document.getElementById("time-slots");
    const label = document.getElementById("selected-time-label");

    if (!selectedBooking.date) {
        container.innerHTML = '<p class="time-empty">Elegí una fecha para consultar los horarios.</p>';
        label.textContent = "Seleccioná un día para ver los horarios";
        return;
    }

    label.textContent = "Turnos para la fecha seleccionada";
    container.innerHTML = Object.entries(bookingSchedule).map(([period, times]) => `
        <section class="time-period">
            <h5>${period}</h5>
            <div class="time-period-options">
                ${times.map(time => `
                    <button type="button" class="time-slot ${selectedBooking.time === time ? "selected" : ""}"
                        data-time="${time}" aria-pressed="${selectedBooking.time === time}"
                        onclick="selectTime('${time}')">${time}</button>
                `).join("")}
            </div>
        </section>
    `).join("");
}

function selectTime(time) {
    selectedBooking.time = time;
    renderTimeSlots();
    updateOrderSummary();
}

function updateOrderSummary() {
    const dateEl = document.getElementById("order-date");
    const timeEl = document.getElementById("order-time");
    if (dateEl) {
        dateEl.textContent = selectedBooking.date
            ? new Date(selectedBooking.date + "T12:00:00").toLocaleDateString("es-AR", {
                day: "numeric", month: "short", year: "numeric"
            })
            : "Sin seleccionar";
    }
    if (timeEl) timeEl.textContent = selectedBooking.time || "Sin seleccionar";
}

function goToStep(stepNumber) {
    if (stepNumber === 3) {
        if (!selectedBooking.barber) {
            alert("Por favor, seleccioná un barbero.");
            return;
        }
        if (!selectedBooking.date) {
            alert("Por favor, seleccioná una fecha.");
            return;
        }
        if (!selectedBooking.time) {
            alert("Por favor, seleccioná un horario disponible.");
            return;
        }

        const formattedDate = new Date(selectedBooking.date + "T12:00:00").toLocaleDateString("es-AR", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
        });
        document.getElementById("booking-summary").innerText =
            `Servicio: ${selectedBooking.service} | Barbero: ${selectedBooking.barber} | Fecha: ${formattedDate} | Hora: ${selectedBooking.time}`;
    }

    document.querySelectorAll(".booking-step").forEach(step => step.style.display = "none");
    document.getElementById(`step-${stepNumber}`).style.display = "block";

    for (let i = 1; i <= 3; i++) {
        const indicator = document.getElementById(`step-${i}-indicator`);
        const active = i === stepNumber;
        indicator.style.background = active ? "var(--accent-gold)" : "rgba(212, 175, 55, 0.15)";
        indicator.style.color = active ? "#000" : "var(--accent-gold)";
    }
}

function confirmBooking(event) {
    event.preventDefault();
    alert(`¡Solicitud de reserva preparada!\n\nServicio: ${selectedBooking.service}\nBarbero: ${selectedBooking.barber}\nFecha: ${selectedBooking.date}\nHora: ${selectedBooking.time}\n\nEsta demostración todavía no verifica disponibilidad en tiempo real.`);
    event.target.reset();
    selectedBooking.service = "";
    selectedBooking.price = "$XX";
    selectedBooking.barber = "";
    selectedBooking.date = "";
    selectedBooking.time = "";
    goToStep(1);
}

document.addEventListener("DOMContentLoaded", () => {
    renderCalendar();
    document.getElementById("calendar-prev")?.addEventListener("click", () => {
        if (calendarOffset > 0) {
            calendarOffset--;
            renderCalendar();
        }
    });
    document.getElementById("calendar-next")?.addEventListener("click", () => {
        calendarOffset++;
        renderCalendar();
    });
});
