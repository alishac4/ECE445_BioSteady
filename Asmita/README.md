## 📅 Weekly Updates

- [Week 1: 01/20 – 01/26 Team Formation](#week-1-0120--0126-team-formation)
- [Week 2: 01/27 – 02/02 Research](#week-2-0127--0202-research)
- [Week 3: 02/03 – 02/09 Project Proposal](#week-3-0203--0209-project-proposal)
- [Week 4: 02/10 – 02/16 Project Proposal Submission](#week-4-0210--0216-project-proposal-submission)
- [Week 5: 02/17 – 02/23 STM32Cube IDE Tutorials](#week-5-0217--0223-stm32cube-ide-tutorials)
- [Week 6: 02/24 – 03/01 Block Diagram and Ordering Parts](#week-6-0224--0301-block-diagram-and-ordering-parts)
- [Week 7: 03/02 – 03/08 Pinout Review and Breadboard Prep](#week-7-0302--0308-pinout-review-and-breadboard-prep)
- [Week 8: 03/09 – 03/15 Breadboard Demo Week](#week-8-0309--0315-breadboard-demo-week)
- [Week 9: 03/16 – 03/22 (Spring Break)](#week-9-0316--0322-spring-break)
- [Week 10: 03/23 – 03/29 Added Heart Rate Sensor to Breadboard](#week-10-0323--0329-added-heart-rate-sensor-to-breadboard)
- [Week 11: 03/30 – 04/05 Firebase Integration](#week-11-0330--0405-firebase-integration)
- [Week 12: 04/06 – 04/12 Testing](#week-12-0406--0412-testing)
- [Week 13: 04/13 – 04/19 Assembling It All Together](#week-13-0413--0419-assembling-it-all-together)
- [Week 14: 04/20 – 04/26 Final Outcome](#week-14-0420--0426-final-outcome)
- [Week 15: 04/27 – 05/03 Final Demo](#week-15-0427--0503-final-demo)
- [Week 16: 05/04 – 05/08 Final Presentation](#week-16-0504--0508-final-presentation)


## Week 1: 01/20 – 01/26 Team Formation
We formed our team and are researching about how different types of sensors work. We found some sources describing the effects of caffeine on heart rate and skin conductance, 
and decided to explore the idea of building a caffeine-detecting device after doing thorough research on the subsystems required and sensors required.

## Week 2: 01/27 – 02/02 Research
Worked on further researching the scope of our project and read through sensor datasheets.  

### MAX30102 Heart Rate Sensor - 
I2C Communication, most functionality requires manipulating control and status registers
Built-in FIFO buffer which can be polled at 100 Hz
Requires 1.8V and 3.3V rails 
MAX30102 Datasheet: https://www.analog.com/media/en/technical-documentation/data-sheets/max30102.pdf
<img width="238" alt="image" src="https://github.com/user-attachments/assets/7ff0dfcf-4a93-4707-92df-ecf6edbaf412" />
### GSR Sensor - 
Analog sensor based on skin conductance; outputs voltage proportional to skin resistance.
ADC output from an LM324 op-amp stage.
5V supply with outputs range 0–3.3V.
Sampling at 5-10Hz
Grove GSR Sensor Datasheet: https://files.seeedstudio.com/wiki/Grove-GSR_Sensor/res/Grove-GSR_Sensor_WiKi.pdf
<img width="570" alt="image" src="https://github.com/user-attachments/assets/0fb30d1e-86c4-4693-aa3b-312f784a232e" />


Decided to use STM32 due its ability to capture ADC readings more accurately and its HAL library which supports I2C, ADC and UART. 
MCU Datasheet: https://www.st.com/resource/en/datasheet/stm32l432kb.pdf

## Week 3: 02/03 – 02/09 Project Proposal
Made initial web-board post regarding project idea, focusing on subsystem requirements, high-level requirements and success metrics.

## Week 4: 02/10 – 02/16 Project Proposal Submission
Worked on Project Proposal with team due this week and submitted it on time.

## Week 5: 02/17 – 02/23 STM32Cube IDE Tutorials
Attended Proposal Review session and made notes on feedback.
Started learning about STM32Cube IDE since I had never worked with it before. Watched tutorials 
on setting up HAL-based boilerplate and its code structure. Installed the software about and started exploring .ioc file initializations etc. 

## Week 6: 02/24 – 03/01 Block Diagram and Ordering Parts
Helped Alisha with reviewing the block diagram input and output signals. 
<img width="550" alt="image" src="https://github.com/user-attachments/assets/63a36d02-a820-4d47-965b-cdf91f30db21" />
Placed order for the following parts to get started with the breadboard:
STM32 Dev Board - [https://www.digikey.com/en/products/detail/stmicroelectronics/NUCLEO-L432KC/6132763]
GSR Sensor - [https://www.digikey.com/en/products/detail/seeed-technology-co-ltd/101020052/5488086]
Heart Sensor - [https://www.digikey.com/en/products/detail/analog-devices-inc-maxim-integrated/MAX30102EFD-T/6188734]

## Week 7: 03/02 – 03/08 Pinout Review and Breadboard Prep
Filled out the Team Evaluation form and signed up for Breadboard Demo. The parts arrived and I realized that I ordered the MAX30102 sensor chip instead of the breakout board.
Since we are on a time crunch, I am going to order the breakout board off of Amazon, and hope for it to arrive on time. 
Spent time studying the STM32L432KCUx pinout diagram to assign the correct pins for ADC, I2C, and UART communication in our system. 

<img width="507" alt="image" src="https://github.com/user-attachments/assets/63efa4ef-dae1-40ae-8484-59ff492658e3" />

### Pin Summary

P0: MCO (High-speed clock input)
PA1: General-purpose I/O
PA2: VCP_TX — Virtual COM Port Transmit for UART
PA3: ADC1_IN8 — used for analog signal input (e.g., GSR sensor)
PA9 & PA10: I2C1_SCL and I2C1_SDA — I2C clock and data lines for sensor communication (e.g., MAX30102)
PA13 & PA14: SWDIO and SWCLK — used for programming/debugging via SWD interface
PA15: VCP_RX — Virtual COM Port Receive
PB3: Connected to LD3 — onboard LED

Began setting up the circuit on a breadboard and successfully connected the GSR sensor to the STM32L432KC. I was able to collect stable analog readings using the microcontroller’s ADC. To visualize the data, I also wrote a Python script that receives data from the STM32 and plots the GSR values graphically.

<img width="349" alt="image" src="https://github.com/user-attachments/assets/4c0514bc-a428-4639-99ea-5f4bca42869b" />
<img width="840" alt="image" src="https://github.com/user-attachments/assets/f7f2f63a-d354-45d7-a5da-fb6c014827ce" />

## Week 8: 03/09 – 03/15 Breadboard Demo Week
The heart rate sensor arrived a day before the Breadboard Demo so I could not incorporate it into the circuit. Demonstrated the circuit to our Professor and TA.
The circuit only supported one subsystem so I need to start working on the heart rate sensor integration as soon as possible to ensure timely testing.

## Week 9: 03/16 – 03/22 (Spring Break)
Did not get much work done this week, enjoying spring break.

## Week 10: 03/23 – 03/29 Added Heart Rate Sensor to Breadboard
Incorporated the MAX30102 heart rate sensor into the circuit alongside the STM32L432KC microcontroller. After configuring the I2C peripheral and initializing the sensor registers, I was able to read IR data from the sensor’s FIFO buffer. Output in the image confirms that the sensor is sending valid readings—visible in the PuTTY terminal with updated FIFO_DATA_REG values and IR data. The firmware was developed and flashed using STM32CubeIDE. 

<img width="511" alt="image" src="https://github.com/user-attachments/assets/1f2c70d7-11c3-4c36-b7e3-063b07e8f395" />

## Week 11: 03/30 – 04/05 Firebase Integration
Worked with Pranav to integrate the sensor readings with the software application. Wrote Python script to parse sensor data, and send that information to 
Firebase store for live collection of data. 
<img width="450" alt="image" src="https://github.com/user-attachments/assets/47dd1c99-2f72-45b6-b123-ba43531e0dd0" />

The MAX30102 outputs raw IR values from its photodetector into a FIFO register. These values fluctuate with the user’s pulse as blood volume changes under the skin. 
To calculate beats per minute (BPM):
I collect the IR signal as a time series.
Using scipy.signal.find_peaks(), I detect peaks in the signal where each peak corresponds to one heartbeat.
I calculate the time interval between peaks (np.diff(peaks)) and compute BPM as:
BPM = 60 / average interval between peaks (in seconds)

<img width="502" alt="image" src="https://github.com/user-attachments/assets/f560da03-83da-4c98-86f0-0ba0f5554a90" />
​
The GSR sensor outputs an analog voltage that represents the skin's electrical resistance. The conversion process is given in the code below where R_FIXED = 10kOhm:
<img width="346" alt="image" src="https://github.com/user-attachments/assets/56dcd386-d456-41a9-aa63-17d59305f90c" />
   
## Week 12: 04/06 – 04/12 Testing
Worked with Alisha to test the sensor subsystem on the PCB with the breadboard. The heart sensor was being detected by the breaboard but the red LED on the sensor would not turn on. I tried to flash the LD3 pin upon detection of the heart sensor given by PARTID = 0x15 which worked, but there was no way to find out why the red LED would not turn on. Finally we decided to test a second heart rate
sensor on a different board, which suprisingly worked. We believe that the LED Path was just broken and it was a miscellaneous error. We did not want to risk losing the functionality of the entire
PCB so we decided to work with two boards to gather the input data.

<img width="385" alt="image" src="https://github.com/user-attachments/assets/72841bfe-3d1c-43ec-b78c-e41aff24a6c4" />


## Week 13: 04/13 – 04/19 Assembling It All Together
Collected all components working separately and integrated them together along with processing the data on the UI built by Pranav.

## Week 14: 04/20 – 04/26 Final Outcome 
Final outcome - 
<img width="450" alt="image" src="https://github.com/user-attachments/assets/d4146d3c-fb44-4cdf-9ea7-7827cc277108" />

Wish we could make a less bulky design but for now, this should work.
## Week 15: 04/27 – 05/03 Final Demo
Presented project in final demo. Filmed extra credit video.

## Week 16: 05/04 – 05/08 Final Presentation
Presentation Week


