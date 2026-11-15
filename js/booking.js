/* MORCUTZ - Sistema de reservas con horarios fijos */

const selectedBooking = {
    service: "",
    price: "",
    barber: "",
    date: "",
    time: ""
};

// Horarios de atención en intervalos de 40 minutos.
const bookingSchedule = {
    "Mañana": ["11:00", "11:40"],
    "Tarde": ["12:20", "13:00", "13:40", "14:20", "15:00", "15:40", "16:20"],
    "Noche": ["17:00", "17:40", "18:20", "19:00", "19:40", "20:20"]
};

function selectService(serviceName, price) {
    selectedBooking.service = serviceName;
    selectedBooking.price = price;
    goToStep(2);
}

function selectBarber(barberName) {
    selectedBooking.barber = barberName;

    document.querySelectorAll(".barber-option").forEach(button => {
        const isSelected = button.textContent.trim() === barberName;
        button.classList.toggle("selected", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
    });
}

function renderTimeSlots() {
    const container = document.getElementById("time-slots");
    const dateInput = document.getElementById("booking-date");
    const dateValue = dateInput.value;
    const label = document.getElementById("selected-time-label");

    selectedBooking.date = dateValue;
    selectedBooking.time = "";
    label.textContent = "Elegí un horario";

    if (!dateValue) {
        container.innerHTML = '<p class="time-empty">Seleccioná una fecha para consultar los horarios.</p>';
        return;
    }

    // Se evita ofrecer turnos en fechas pasadas y domingos.
    const selectedDate = new Date(dateValue + "T12:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);

    if (dayStart < today) {
        container.innerHTML = '<p class="time-empty">Elegí una fecha igual o posterior a hoy.</p>';
        return;
    }

    if (selectedDate.getDay() === 0) {
        container.innerHTML = '<p class="time-empty">Los domingos no hay atención. Elegí otro día.</p>';
        return;
    }

    container.innerHTML = Object.entries(bookingSchedule).map(([period, times]) => `
        <section class="time-period">
            <h5>${period}</h5>
            <div class="time-period-options">
                ${times.map(time => `
                    <button type="button"
                        class="time-slot"
                        data-time="${time}"
                        onclick="selectTime('${time}')">
                        ${time}
                    </button>
                `).join("")}
            </div>
        </section>
    `).join("");
}

function selectTime(time) {
    selectedBooking.time = time;

    document.querySelectorAll(".time-slot").forEach(button => {
        const isSelected = button.dataset.time === time;
        button.classList.toggle("selected", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
    });

    document.getElementById("selected-time-label").textContent = "Horario elegido: " + time;
}

function goToStep(stepNumber) {
    if (stepNumber === 3) {
        const dateInput = document.getElementById("booking-date");
        selectedBooking.date = dateInput ? dateInput.value : "";

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

        const chosenDate = new Date(selectedBooking.date + "T12:00:00");
        const formattedDate = chosenDate.toLocaleDateString("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        document.getElementById("booking-summary").innerText =
            `Servicio: ${selectedBooking.service} | Barbero: ${selectedBooking.barber} | Fecha: ${formattedDate} | Hora: ${selectedBooking.time}`;
    }

    document.querySelectorAll(".booking-step").forEach(step => {
        step.style.display = "none";
    });
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

    alert(`¡Solicitud de reserva preparada!\n\nServicio: ${selectedBooking.service}\nBarbero: ${selectedBooking.barber}\nFecha: ${selectedBooking.date}\nHora: ${selectedBooking.time}\n\nRecordá que esta demostración todavía no verifica disponibilidad en tiempo real.`);

    event.target.reset();
    selectedBooking.service = "";
    selectedBooking.price = "";
    selectedBooking.barber = "";
    selectedBooking.date = "";
    selectedBooking.time = "";
    document.querySelectorAll(".barber-option").forEach(button => button.classList.remove("selected"));
    goToStep(1);
}

document.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById("booking-date");
    if (dateInput) {
        const localToday = new Date();
        const year = localToday.getFullYear();
        const month = String(localToday.getMonth() + 1).padStart(2, "0");
        const day = String(localToday.getDate()).padStart(2, "0");
        dateInput.min = `${year}-${month}-${day}`;
        dateInput.addEventListener("change", renderTimeSlots);
    }
});