const electron = require('electron');
console.log('--- ELECTRON DIAGNOSTICS ---');
console.log('Type of electron return:', typeof electron);
console.log('Keys in electron object:', Object.keys(electron));
if (electron.app) {
    console.log('App object found!');
    process.exit(0);
} else {
    console.log('App object NOT found.');
    process.exit(1);
}
