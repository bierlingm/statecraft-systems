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
})();
