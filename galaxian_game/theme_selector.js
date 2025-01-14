function showThemeSelection() {
    const themeSelectionScreen = document.getElementById('themeSelectionScreen');
    const imageCanvas = document.getElementById('myImageCanvas');
    const webGLCanvas = document.getElementById('myWebGLCanvas');

    // Show theme selection screen
    themeSelectionScreen.style.display = 'flex';

    // Listen for keypress to select theme
    window.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 's') {
            // Load Space theme
            loadScript('rasterize_space.js');
        } else if (event.key.toLowerCase() === 'o') {
            // Load Ocean theme
            loadScript('rasterize_ocean.js');
        }
    });

    function loadScript(scriptPath) {
        // Remove event listener to prevent multiple loads
        window.removeEventListener('keydown', arguments.callee);

        // Hide theme selection screen
        themeSelectionScreen.style.display = 'none';

        // Show canvases
        imageCanvas.style.display = 'block';
        webGLCanvas.style.display = 'block';

        // Dynamically load the selected script
        const script = document.createElement('script');
        script.src = scriptPath;
        script.type = 'text/javascript';

        script.onload = () => {
            if (typeof main === 'function') {
                main(); // Call the `main` function from the loaded script
            } else {
                console.error('The loaded script does not define a main() function.');
            }
        };

        script.onerror = () => {
            console.error('Failed to load the script:', scriptPath);
        };

        document.head.appendChild(script);
    }
}
