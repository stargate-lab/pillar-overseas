(function () {
  var WHATSAPP_NUMBER = window.PILLAR_CONFIG.whatsappNumber;
  var LEAD_SHEET_URL = window.PILLAR_CONFIG.leadSheetUrl;

  // Fire-and-forget save to the Google Sheet lead log (see apps-script/Code.gs).
  // no-cors + form-encoded body avoids a CORS preflight, which Apps Script doesn't
  // handle; we don't need to read the response, just get the row saved.
  // Inactive unless PILLAR_CONFIG.leadSheetUrl is set.
  function saveLead(data) {
    if (!LEAD_SHEET_URL) return;
    var body = new URLSearchParams(data).toString();
    fetch(LEAD_SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }).catch(function () {
      // Silently ignore — WhatsApp is still the primary, guaranteed path.
    });
  }

  // Netlify Forms: submitting via fetch (instead of a native form POST, since
  // we intercept submit for validation/WhatsApp) requires this exact AJAX
  // pattern per Netlify's docs. Only works once the site is actually deployed
  // on Netlify — silently no-ops in local dev or on other hosts.
  function saveLeadToNetlify(data) {
    var body = new URLSearchParams(Object.assign({ 'form-name': 'reserve' }, data)).toString();
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }).catch(function () {
      // Silently ignore — WhatsApp is still the primary, guaranteed path.
    });
  }

  // Wire every [data-whatsapp-link] anchor to the configured number in one place.
  document.querySelectorAll('[data-whatsapp-link]').forEach(function (el) {
    el.href = 'https://wa.me/' + WHATSAPP_NUMBER;
  });

  // RESERVE MODAL — every [data-open-reserve] trigger opens it; Escape,
  // the backdrop, or the close/done buttons dismiss it.
  var modal = document.getElementById('reserveModal');
  var modalFormView = document.getElementById('modalFormView');
  var modalSuccessView = document.getElementById('modalSuccessView');
  var modalSuccessTitle = document.getElementById('modalSuccessTitle');
  var lastTrigger = null;

  function openModal(trackValue) {
    lastTrigger = document.activeElement;
    if (trackValue) {
      var trackField = document.getElementById('track');
      trackField.value = trackValue;
      trackField.closest('.field').classList.remove('invalid');
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    var firstField = document.getElementById('name');
    if (firstField) firstField.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    // Reset back to the form view for next time, once hidden so nothing visibly flashes.
    modalSuccessView.hidden = true;
    modalFormView.hidden = false;
  }

  document.querySelectorAll('[data-open-reserve]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(el.dataset.track || '');
    });
  });

  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  document.getElementById('modalDoneBtn').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  var form = document.getElementById('reserveForm');
  if (!form) return;

  var submitBtn = form.querySelector('button[type="submit"]');
  var btnLabel = submitBtn.querySelector('.btn-label');
  var defaultLabel = btnLabel.textContent;
  var errorSummary = document.getElementById('formErrorSummary');

  var fields = {
    name: {
      el: document.getElementById('name'),
      validate: function (v) { return v.trim().length >= 2; },
      message: 'Please enter your full name.'
    },
    phone: {
      el: document.getElementById('phone'),
      // Sri Lankan mobile numbers: optional +94/0 prefix, then 7 and 8 more digits,
      // spaces/dashes allowed for readability.
      validate: function (v) { return /^(?:\+?94|0)?7[0-9](?:[\s-]?[0-9]){7}$/.test(v.trim()); },
      message: 'Enter a valid WhatsApp number, e.g. 07X XXX XXXX.'
    },
    district: {
      el: document.getElementById('district'),
      validate: function (v) { return v.trim().length >= 2; },
      message: 'Please enter your district.'
    },
    track: {
      el: document.getElementById('track'),
      validate: function (v) { return v !== ''; },
      message: 'Please select a track.'
    }
  };

  function setFieldState(key, isValid) {
    var field = fields[key];
    var wrapper = field.el.closest('.field');
    wrapper.classList.toggle('invalid', !isValid);
  }

  function validateAll() {
    var allValid = true;
    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      var isValid = field.validate(field.el.value);
      setFieldState(key, isValid);
      if (!isValid) allValid = false;
    });
    return allValid;
  }

  // Clear a field's error as soon as the user fixes it.
  Object.keys(fields).forEach(function (key) {
    var field = fields[key];
    var eventName = field.el.tagName === 'SELECT' ? 'change' : 'input';
    field.el.addEventListener(eventName, function () {
      if (field.validate(field.el.value)) setFieldState(key, true);
    });
  });

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle('loading', isLoading);
    btnLabel.textContent = isLoading ? 'Submitting…' : defaultLabel;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateAll()) {
      errorSummary.textContent = 'Please fix the highlighted fields before continuing.';
      errorSummary.classList.add('visible');
      var firstInvalid = form.querySelector('.field.invalid input, .field.invalid select');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    errorSummary.classList.remove('visible');
    setLoading(true);

    var name = fields.name.el.value.trim();
    var phone = fields.phone.el.value.trim();
    var district = fields.district.el.value.trim();
    var track = fields.track.el.value;

    saveLead({ name: name, phone: phone, district: district, track: track });
    saveLeadToNetlify({ name: name, phone: phone, district: district, track: track });

    modalSuccessTitle.textContent = 'Thanks, ' + name + '!';
    modalFormView.hidden = true;
    modalSuccessView.hidden = false;
    var doneBtn = document.getElementById('modalDoneBtn');
    if (doneBtn) doneBtn.focus();

    // Reset the form itself so a future open (after closeModal resets the view) starts fresh.
    form.reset();
    Object.keys(fields).forEach(function (key) { setFieldState(key, true); });
    setLoading(false);
  });
})();
