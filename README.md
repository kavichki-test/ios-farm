## Requirements (the latest stable version):
- Appium
- Node (with packages 'ws' and 'node-ios-device')
- python 3 (with packages 'wedsocket', 'websocket-cliet', 'asyncio')
- XCode

## Preconditions:
- Replace "path" in "web/js/server.js" (line 119) with folder path
- Replace "xcodeOrgId" in "test__appium.py" (line 40) with your Apple Developer Id
- Replace "WEBDRIVER__PATH" in "smile.sh" (line 3) with "appium-webdriver" node module path
- You must add a new device by id in function "run()" (web/start.html (line 125)) for catching action by click on your device on start page

## Steps:
- Open XCode and build WebdriverAgentRunner for your devices
- Allow certificate on your devices
- Start server "node server.js" (from web/js)
- Run "start.html" (from web) in browser (Google Chrome recommended)
- Probabbly, your first start will be failed due to unapproved certificate. You should restart "node server.js" 

Running sreencasting may take about 2-3 minutes (for first launching)
