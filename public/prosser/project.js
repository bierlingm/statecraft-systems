(function () {
  var select = document.getElementById('preview-version');
  var preview = document.getElementById('site-preview');
  var link = document.getElementById('open-preview');
  select.addEventListener('change', function () {
    var path = '/prosser/versions/' + select.value + '/';
    preview.src = path;
    preview.title = 'Prosser House website preview, ' + select.options[select.selectedIndex].text;
    link.href = path;
  });
  var form = document.getElementById('decision-form');
  var status = document.getElementById('decision-status');
  if (form) {
    Array.prototype.forEach.call(form.querySelectorAll('textarea'), function (field) {
      var saved = localStorage.getItem('prosser-decision-' + field.name);
      if (saved) field.value = saved;
      field.addEventListener('input', function () { localStorage.setItem('prosser-decision-' + field.name, field.value); });
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var lines = Array.prototype.map.call(form.querySelectorAll('textarea'), function (field) { return field.name + ':\\n' + (field.value.trim() || '(no answer)'); });
      window.location.href = 'mailto:contact@statecraft.systems?subject=' + encodeURIComponent('Prosser House decisions') + '&body=' + encodeURIComponent(lines.join('\\n\\n'));
      status.textContent = 'Your email app should open with the answers ready to send.';
    });
  }
})();
