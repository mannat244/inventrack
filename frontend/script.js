fetch('/api/img/')
    .then(response => response.text())
    .then(data => {
      document.getElementById('random-image').src = data;
    })
    .catch(error => console.error('Error fetching image:', error));
  


