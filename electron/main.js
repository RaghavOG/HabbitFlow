import { app, BrowserWindow } from 'electron';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    title: "HabitFlow"
  });

  win.loadURL('https://habitflow-new.vercel.app/'); // your deployed app
}

app.whenReady().then(createWindow);