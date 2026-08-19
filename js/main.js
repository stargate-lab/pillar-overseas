(function () {
  var WHATSAPP_NUMBER = window.PILLAR_CONFIG.whatsappNumber;

  // Wire every [data-whatsapp-link] anchor to the configured number in one place.
  document.querySelectorAll('[data-whatsapp-link]').forEach(function (el) {
    el.href = 'https://wa.me/' + WHATSAPP_NUMBER;
  });

  var form = document.getElementById('reserveForm');
  if (!form) return;

  var submitBtn = form.querySelector('button[type="submit"]');
  var btnLabel = submitBtn.querySelector('.btn-label');
  var defaultLabel = btnLabel.textContent;
  var errorSummary = document.getElementById('formErrorSummary');
  var successMsg = document.getElementById('formSuccess');

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
    btnLabel.textContent = isLoading ? 'Redirecting…' : defaultLabel;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    successMsg.classList.remove('visible');

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

    var message =
      "Hi Pillar Overseas, I'd like to reserve a seat for Cohort 01.%0A%0A" +
      'Name: ' + encodeURIComponent(name) + '%0A' +
      'WhatsApp: ' + encodeURIComponent(phone) + '%0A' +
      'District: ' + encodeURIComponent(district) + '%0A' +
      'Track: ' + encodeURIComponent(track);

    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + message;

    window.open(url, '_blank');
    successMsg.classList.add('visible');

    // Re-enable the button after a beat; window.open doesn't navigate this tab away,
    // so the form should stay usable if the user needs to resend.
    window.setTimeout(function () { setLoading(false); }, 1200);
  });
})();
