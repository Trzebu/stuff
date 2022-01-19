router-cc253x-std.hex
=====================
The standard formware without any additional diagnostic messages.

router-cc253x-diag.hex
======================
The firmware with additional diagnostic messages. This firmware sends the “genBinaryValue” report 
for every neighbor in a network. This report looks like:
	
{
description: '28069/0x00158D0001DE7964',
inactiveText: 'PARENT',
presentValue: 6,
relinquishDefault: 1,
minimumOffTime: 0
}

Where:

description – network and MAC address.
inactiveText – device role in a network.
presentValue – RSSI value of the last received packet (rxLqi).
relinquishDefault (optional) – path depth.
minimumOffTime (optional) – number of associated devices.

router-cc2531-diag-usb.hex
=========================
The firmware also sends additional diagnostic messages. But this firmware has USB support inside. 
If you'll connect this USB dongle to a computer a new virtual COM port will appear. The router will 
also dump diagnostic messages to this port.

router-cc2530-cc2591-xxxxx.hex
=========================
The firmware is compilted for a special version of a CC2530 board with an additional CC2591 RF chip.


Lights
=========================

Short fast blinks (one per second) – the router is connecting to a network.
Short long blinks (one per 4 seconds) – normal operations.
Three short blinks – the router cannot send a report to a coordinator.

Pairing
=========================
Flash firmware and permit joining to a network on your coordinator.

Re-pairing
=========================
CC2530: Power on, wait 2 seconds, power off, repeat this cycle three times.
CC2531: Power on, press and hold down the S2 button for 5 seconds.

-------------------
Home page: https://ptvo.info