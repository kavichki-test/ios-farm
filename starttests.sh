#!/bin/sh

LOCAL__PATH="$(pwd)"
TEST_WITH=python3
TEST_NAME=$LOCAL__PATH/test__appium.py
UDID=$1
DEVICE_NAME=$2

udid=$UDID devicename=$DEVICE_NAME $TEST_WITH $TEST_NAME >> $LOCAL__PATH/log/python_test.log &

# udid=42bc4690b24da66f0a3640b6a39127f29e8cddaa devicename='iPhone SE' $TEST_WITH $TEST_NAME >> $LOCAL__PATH/log/python_test.log &