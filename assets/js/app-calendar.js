document.addEventListener("DOMContentLoaded", function () {
  const assetsPath = document.documentElement.getAttribute('data-assets-path');

        const calendarEl = document.getElementById("calendar"),
        sidebar = document.querySelector(".app-calendar-sidebar"),
        addEventSidebarEl = document.getElementById("addEventSidebar"),
        overlay = document.querySelector(".app-overlay"),
        offcanvasTitle = document.querySelector(".offcanvas-title"),
        toggleSidebarBtn = document.querySelector(".btn-toggle-sidebar"),
        addBtn = document.getElementById("addEventBtn"),
        deleteBtn = document.querySelector(".btn-delete-event"),
        cancelBtn = document.querySelector(".btn-cancel"),
        titleInput = document.getElementById("eventTitle"),
        startInput = document.getElementById("eventStartDate"),
        endInput = document.getElementById("eventEndDate"),
        urlInput = document.getElementById("eventURL"),
        locationInput = document.getElementById("eventLocation"),
        descriptionInput = document.getElementById("eventDescription"),
        allDaySwitch = document.querySelector(".allDay-switch"),
        selectAllCheckbox = document.querySelector(".select-all"),
        inlineCalendar = document.querySelector(".inline-calendar"),
        labelSelect = $("#eventLabel"),
        guestSelect = $("#eventGuests"),
        filterCheckboxes = Array.from(document.querySelectorAll(".input-filter"));

  const direction = document.documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
  const labelColors = { 'Word Session': "primary", 'Jesus Enthroned Events': "warning", 'Planning': "success", 'Holiday': "danger", 'ETC': "info" };
  let selectedEvent = null;

  const calendarOffcanvas = new bootstrap.Offcanvas(addEventSidebarEl);

  // Select2
  if (labelSelect.length) {
    labelSelect.wrap('<div class="position-relative"></div>').select2({
      placeholder: "Select value",
      dropdownParent: labelSelect.parent(),
      templateResult: e => e.id ? `<span class='badge badge-dot bg-${$(e.element).data("label")} me-2'> </span>${e.text}` : e.text,
      templateSelection: e => e.id ? `<span class='badge badge-dot bg-${$(e.element).data("label")} me-2'> </span>${e.text}` : e.text,
      escapeMarkup: m => m
    });
  }

  if (guestSelect.length) {
    guestSelect.wrap('<div class="position-relative"></div>').select2({
      placeholder: "Select guests",
      dropdownParent: guestSelect.parent(),
      closeOnSelect: false,
      templateResult: e => e.id ? `<div class='d-flex align-items-center'><div class='avatar avatar-xs me-2'><img src='${assetsPath}img/avatars/${$(e.element).data("avatar")}' class='rounded-circle' /></div>${e.text}</div>` : e.text,
      templateSelection: e => e.id ? `<div class='d-flex align-items-center'><div class='avatar avatar-xs me-2'><img src='${assetsPath}img/avatars/${$(e.element).data("avatar")}' class='rounded-circle' /></div>${e.text}</div>` : e.text,
      escapeMarkup: m => m
    });
  }

  // Flatpickr
  const startPicker = startInput?.flatpickr({ enableTime: true, altInput: true, altFormat: "Y-m-dTH:i:S" });
  const endPicker = endInput?.flatpickr({ enableTime: true, altInput: true, altFormat: "Y-m-dTH:i:S" });
  const inlinePicker = inlineCalendar?.flatpickr({ inline: true });

  // Clear form
  function resetForm() {
    titleInput.value = '';
    startInput.value = '';
    endInput.value = '';
    urlInput.value = '';
    locationInput.value = '';
    descriptionInput.value = '';
    allDaySwitch.checked = false;
    labelSelect.val('').trigger("change");
    guestSelect.val('').trigger("change");
  }

  // Filter checker
  function getActiveFilters() {
    return filterCheckboxes
      .filter(cb => cb.checked)
      .map(cb => cb.dataset.value.toLowerCase());
  }

  // Initialize FullCalendar
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    selectable: true,
    editable: true,
    direction: direction,
    navLinks: true,
    headerToolbar: {
      start: 'prev,next, title',
      end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
    },
    
    //plugins: ['dayGrid', 'timeGrid', 'interaction', 'list'],
    events: function (fetchInfo, successCallback, failureCallback) {
      fetch('manage/get-schedule.php')
        .then(res => res.json())
        .then(data => {
          const filters = getActiveFilters();
          const filteredEvents = data.filter(e =>
            filters.includes(e.extendedProps?.calendar?.toLowerCase())
          );
          successCallback(filteredEvents);
        })
        .catch(error => {
          console.error('Error loading events:', error);
          failureCallback(error);
        });
    },
    eventClassNames: function ({ event }) {
      const label = event.extendedProps?.calendar || 'default';
      return [`bg-label-${labelColors[label] || 'primary'}`];
    },
    dateClick: function (info) {
      const dateStr = moment(info.date).format("YYYY-MM-DD");
      resetForm();
      startInput.value = dateStr;
      endInput.value = dateStr;
      calendarOffcanvas.show();
      addBtn.classList.remove("btn-update-event");
      addBtn.classList.add("btn-add-event");
      deleteBtn.classList.add("d-none");
    },
    eventClick: function ({ event }) {
      selectedEvent = event;
      calendarOffcanvas.show();
      titleInput.value = event.title;
      startPicker.setDate(event.start, true, "Y-m-d");
      endPicker.setDate(event.end || event.start, true, "Y-m-d");
      allDaySwitch.checked = event.allDay;
      urlInput.value = event.url || '';
      labelSelect.val(event.extendedProps.calendar).trigger("change");
      locationInput.value = event.extendedProps.location || '';
      descriptionInput.value = event.extendedProps.description || '';
      guestSelect.val(event.extendedProps.guests || []).trigger("change");

      addBtn.classList.remove("btn-add-event");
      addBtn.classList.add("btn-update-event");
      deleteBtn.classList.remove("d-none");
    }
  });

  calendar.render();

  // Add event
  addBtn.addEventListener("click", function () {
    const isNew = addBtn.classList.contains("btn-add-event");
    const eventData = {
      title: titleInput.value,
      start: startInput.value,
      end: endInput.value,
      allDay: allDaySwitch.checked,
      url: urlInput.value,
      extendedProps: {
        calendar: labelSelect.val(),
        location: locationInput.value,
        description: descriptionInput.value,
        guests: guestSelect.val()
      }
    };

    if (isNew) {
      calendar.addEvent(eventData);
    } else if (selectedEvent) {
      selectedEvent.setProp('title', eventData.title);
      selectedEvent.setStart(eventData.start);
      selectedEvent.setEnd(eventData.end);
      selectedEvent.setAllDay(eventData.allDay);
      selectedEvent.setExtendedProp('calendar', eventData.extendedProps.calendar);
      selectedEvent.setExtendedProp('location', eventData.extendedProps.location);
      selectedEvent.setExtendedProp('description', eventData.extendedProps.description);
      selectedEvent.setExtendedProp('guests', eventData.extendedProps.guests);
    }

    calendarOffcanvas.hide();
  });

  // Delete event
  deleteBtn.addEventListener("click", function () {
    if (selectedEvent) {
      selectedEvent.remove();
      calendarOffcanvas.hide();
    }
  });

  // Filter interaction
  filterCheckboxes.forEach(checkbox =>
    checkbox.addEventListener("change", () => calendar.refetchEvents())
  );

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("click", function () {
      document.querySelectorAll(".input-filter").forEach(cb => cb.checked = selectAllCheckbox.checked);
      calendar.refetchEvents();
    });
  }

  if (inlinePicker) {
    inlinePicker.config.onChange.push(function (selectedDates) {
      calendar.changeView(calendar.view.type, moment(selectedDates[0]).format("YYYY-MM-DD"));
    });
  }

});
