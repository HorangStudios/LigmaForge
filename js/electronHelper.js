function isElectron() {
  const isNode = typeof process !== 'undefined' && !!process.versions.electron;
  const isUA = typeof navigator === 'object' && navigator.userAgent.indexOf('Electron') >= 0;
  return isNode || isUA;
}

function redirect(url) {
    if (isElectron()) interface.redirect(url);
    else window.open(url);
}

var verFetched;
async function getVersion(pkgdir) {
    if (verFetched) return verFetched;
    else {
        let getpackage = await fetch(pkgdir);
        getpackage = await getpackage.json();
        verFetched = getpackage.version;
        return verFetched;
    }
}