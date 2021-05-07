#!/usr/bin/python
#  -*- coding: utf-8 -*-

import os
import unittest
import string
import random
import time
import sys
import asyncio
import websockets
import json
import random
import datetime

from appium import webdriver
from appium.webdriver.common.touch_action import TouchAction
from websocket import create_connection

class BasicTest(unittest.TestCase):
	udid = ""
	devicename = ""

	def setUp(self):
		now = datetime.datetime.now()
		print (now.strftime("%Y-%m-%d %H:%M") + ": Test preparation");
		bundle_id = "com.apple.AppStore"
		device_name = str(self.devicename)
		udid = str(self.udid)
		self.driver = webdriver.Remote(
			command_executor='http://127.0.0.1:4723/wd/hub',
			desired_capabilities={
				'bundleId': bundle_id,
				'platformName': 'iOS',
				'platformVersion': "14.4",
				'deviceName': device_name,
				'udid': udid,
				"realDevice": True,
				'realDeviceLogger': 'idevicesyslog',
				"xcodeOrgId": "ENTER YOUR ID",
				"xcodeSigningId": "iPhone Developer"
				})
		self.driver.background_app(-1)

	def test_ui_clearing(self):
		now = datetime.datetime.now()
		udid = self.udid
		HOST = 'ws://localhost'  	# The server's hostname or IP address
		PORT = ':9030/:'        	# The port used by the server

		uri = HOST + PORT + udid + '/commuter'

		ws = create_connection(uri)
		print (now.strftime("%Y-%m-%d %H:%M") + ": We are ready to start");
		ws.send(json.dumps({'action': 'deviceready', 'udid': udid, 'whoyouare': 'commuter'}));
		while True:
			ws.send(json.dumps({"action": "givemeaction", "toudid": udid, 'whoyouare': 'commuter'}))
			response = json.loads(ws.recv())

			if response["action"] == 'tap':
				TouchAction(self.driver).tap(None, response["x"], response["y"]).release().perform()
				print (now.strftime("%Y-%m-%d %H:%M") + ": Make tap")
			elif response["action"] == 'home':
				self.driver.background_app(-1)
				print (now.strftime("%Y-%m-%d %H:%M") + ": Make home")
			elif response["action"] == 'swipe':
				self.driver.swipe(response["x0"], response["y0"], response["x1"], response["y1"], 500);
				print (now.strftime("%Y-%m-%d %H:%M") + ": Make swipe")
			elif response["action"] == 'doubletap':
				self.driver.double_tap(None, response["x"], response["y"]).release().perform()
				print (now.strftime("%Y-%m-%d %H:%M") + ": Make double tap")
			elif response["action"] == 'longtap':
				self.driver.long_press(None, response["x"], response["y"]).release().perform()
				print (now.strftime("%Y-%m-%d %H:%M") + ": Make long tap")
			elif response["action"] == 'landscape':
				try:
					self.driver.orientation = "LANDSCAPE"
					print (now.strftime("%Y-%m-%d %H:%M") + ": Change orientation to LANDSCAPE")
				except:
					print (now.strftime("%Y-%m-%d %H:%M") + ": Couldn't change orientation to LANDSCAPE")
			elif response["action"] == 'portrait':
				try:
					self.driver.orientation = "PORTRAIT"
					print (now.strftime("%Y-%m-%d %H:%M") + ": Change orientation to PORTRAIT")
				except:
					print (now.strftime("%Y-%m-%d %H:%M") + ": Couldn't change orientation to PORTRAIT")

	def tearDown(self):
		self.driver.quit()

if __name__ == '__main__':
	BasicTest.udid = os.environ.get('udid', BasicTest.udid)
	BasicTest.devicename = os.environ.get('devicename', BasicTest.devicename)
	suite = unittest.TestLoader().loadTestsFromTestCase(BasicTest)
	unittest.TextTestRunner(verbosity=2).run(suite)