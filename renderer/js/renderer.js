const { ipcRenderer } = require('electron');
const Toastify = require('toastify-js');

const form = document.querySelector('form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');


// file select listener
img.addEventListener('change', loadImage);
// form submit listener
form.addEventListener('submit', resizeImage);

function loadImage(e) {
    const file = e.target.files[0];

    if (file) {
        img.src = URL.createObjectURL(file);
    }
}

function alertError(message) {
    Toastify({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: 'linear-gradient(to right, #ff416c, #ff4b2b)',
            color: 'white',
            textAlign: 'center',
        }
    })
    alert(message);
}

function alertSuccess(message) {
    Toastify({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: 'linear-gradient(to right, #00b09b, #96c93d)',
            color: 'white',
            textAlign: 'center',
        }
    })
    alert(message);
}

function resizeImage(e) {
    e.preventDefault();

    console.log(e);

    if (!img.files[0]) {
        alertError('Please upload an image');
        return;
    }

    if (widthInput.value === '' || heightInput.value === '') {
        alertError('Please enter width and height');
        return;
    }

    // Electron adds a bunch of extra properties to the file object
    // const imgPath = img.files[0].path;
    // if (!imgPath) {
    //     alertError('Invalid image file');
    //     return;
    // }

    const file = img.files[0];
    const width = widthInput.value;
    const height = heightInput.value;

    // send event from renderer to main process
    ipcRenderer.send('image:resize', { file, width, height });
}


// ipcRenderer.on('image:done', () => {
//     alertSuccess(`Image resized to ${heightInput.value} x ${widthInput.value}`);
// });
