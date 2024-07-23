document.addEventListener('DOMContentLoaded', function () {
  const menuLinks = document.querySelectorAll('a.menu');
  const nav = document.querySelector('.site-header nav');

  menuLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      if (nav.classList.contains('open')) {
        nav.classList.remove('open');
        nav.style.maxHeight = '0';
      } else {
        nav.classList.add('open');
        nav.style.maxHeight = nav.scrollHeight + 'px';
      }
    });
  });

  window.addEventListener('resize', function () {
    const width = window.innerWidth;
    if (width >= 680 && nav.classList.contains('open')) {
      nav.classList.remove('open');
      nav.style.maxHeight = '';
    }
  });
});

document.addEventListener('DOMContentLoaded', function () {
  var vpH = window.innerHeight;
  var vH = vpH - 350;
  var overlays = document.querySelectorAll('.overlay');
  var featuredImages = document.querySelectorAll('.featured-image');

  overlays.forEach(function (overlay) {
    overlay.style.height = vH + 'px';
  });

  featuredImages.forEach(function (featuredImage) {
    featuredImage.style.height = vH + 'px';
  });
});

document.addEventListener('DOMContentLoaded', function () {
  var featuredImageDiv = document.querySelector('div.featured-image');
  if (!featuredImageDiv) {
    return;
  }
  var imgUrl = window.getComputedStyle(featuredImageDiv).backgroundImage;

  if (imgUrl) {
    imgUrl = imgUrl.substring(4, imgUrl.length - 1).replace(/"/g, '');
    var img = new Image();
    img.src = imgUrl;

    img.onload = function () {
      var loadingImages = document.querySelectorAll('img.loading');
      loadingImages.forEach(function (loadingImage) {
        loadingImage.style.transition = 'opacity 0.5s';
        loadingImage.style.opacity = '0';
        setTimeout(function () {
          loadingImage.style.display = 'none';
        }, 500);
      });

      var overlays = document.querySelectorAll('div.overlay');
      overlays.forEach(function (overlay) {
        overlay.style.transition = 'opacity 0.6s';
        overlay.style.opacity = '0.6';
      });
    };
  }
});
