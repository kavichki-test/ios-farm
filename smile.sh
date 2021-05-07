#!/bin/sh

WEBDRIVER__PATH="/usr/local/lib/node_modules/appium/node_modules/appium-webdriveragent" # classic path to module, which you build in XCode
UDID=$1

xcodebuild -project $WEBDRIVER__PATH/WebDriverAgent.xcodeproj -scheme WebDriverAgentRunner -destination "id=$UDID" test | while read line ; do 
    if echo "$line" | grep "ServerURLHere->*<-ServerURLHer" 
    then
        echo {\"data\": \"run\"}
    else
        echo {\"data\": \"$line\"}
    fi
done