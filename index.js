console.log('Hello from Electron 👋')

const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');

process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;
let aboutWindow;

// some events inside electron
function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        width: 300,
        height: 300,
        title: 'About Electron',
        resizable: false
    })

    aboutWindow.loadFile(path.join(__dirname + './renderer/about.html'));
}

function createMainWindow() {
    const win = new BrowserWindow({
        width: isDev ? 1000 : 500,
        height: 600,
        resizable: isDev,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js'),
        }
    })

    if (isDev) {
        win.webContents.openDevTools();
    }

    win.loadFile(path.join(__dirname, './renderer/index.html'));
};

app.on('ready', () => {
    createMainWindow();

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    // Remove variable from memory
    // mainWindow.on('closed', () => mainWindow = null);
})

const menu = [
    ...(isMac ? [{
        label: app.name,
        submenu: [{
            label: 'About',
            click: createAboutWindow
        }]
    }] : []),

    {
        role: 'fileMenu'
    },

    ...(!isMac ? [{
        label: 'Help',
        submenu: [{
            label: 'About',
            click: createAboutWindow
        }]
    }] : []),

    ...(isDev ? [{
        label: 'Developer',
        submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { role: 'toggledevtools' },
            { role: 'togglefullscreen' },
        ],
    }] : [])
];

// Response to the resize image catch event from process
ipcMain.on('image:resize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageresizer');
    resizeImage(options);
})

// Resize and save image
async function resizeImage({ imgPath, height, width, dest }) {
    try {
        const newPath = await resizeImg(fs.readFileSync(imgPath), { width, height, dest });

        const filename = path.basename(imgPath);

        // create destination folder if it doesn't exist
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }

        fs.writeFileSync(path.join(dest, filename), newPath);

        mainWindow.webContents.send('image:done');

        shell.openPath(dest);
    } catch (error) {
        console.log(error);
    }
}


app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
})