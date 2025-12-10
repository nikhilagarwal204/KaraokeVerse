# KaraokeVerse Development Setup

## Prerequisites

- Node.js >= 20.19.0
- Chrome browser (for WebXR Emulator)

## WebXR Emulator Setup

To develop and test VR features without a physical headset, install the WebXR API Emulator Chrome extension:

1. **Install the Extension**
   - Open Chrome and go to: [WebXR API Emulator](https://chrome.google.com/webstore/detail/webxr-api-emulator/mjddjgeghkdijejnciaefnkjmkafnnje)
   - Click "Add to Chrome"

2. **Configure the Emulator**
   - Open Chrome DevTools (F12 or Cmd+Option+I on macOS)
   - Look for the "WebXR" tab in DevTools
   - Select "Meta Quest 3" or similar device from the dropdown
   - Enable "Stereo effect" if you want to see the VR view

3. **Using the Emulator**
   - The emulator simulates VR controllers (not hand tracking)
   - Use mouse to move controllers in the scene
   - Click to simulate trigger press (grab action)
   - Use keyboard shortcuts to rotate/move the headset view

## Running the Dev Server

```bash
npm run dev
```

The server starts at `https://localhost:8081/` (HTTPS is required for WebXR).

## Testing VR Mode

1. Open `https://localhost:8081/` in Chrome
2. Open DevTools and go to the WebXR tab
3. Click "Enter VR" button in the app
4. The emulator will activate and show the VR scene
5. Use the DevTools WebXR panel to control the emulated headset and controllers

## Emulator Controls

| Action | Control |
|--------|---------|
| Move headset | WASD keys in WebXR panel |
| Rotate headset | Click and drag in WebXR panel |
| Move controller | Click and drag controller in 3D view |
| Trigger press | Click on controller trigger button |
| Grip press | Click on controller grip button |

## Notes

- The IWSDK uses HTTPS by default (via vite-plugin-mkcert)
- Hand tracking is enabled but requires actual Quest hardware
- Controllers work in both emulator and on Quest device
- The emulator provides a good approximation but some features may differ on actual hardware
