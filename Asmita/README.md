## 📅 Weekly Schedule Index

- [Week 1: 01/15 – 01/21](#week-1-0115--0121)
- [Week 2: 01/22 – 01/28](#week-2-0122--0128)
- [Week 3: 01/29 – 02/04](#week-3-0129--0204)
- [Week 4: 02/05 – 02/11](#week-4-0205--0211)
- [Week 5: 02/12 – 02/18](#week-5-0212--0218)
- [Week 6: 02/19 – 02/25](#week-6-0219--0225)
- [Week 7: 02/26 – 03/03](#week-7-0226--0303)
- [Week 8: 03/04 – 03/10](#week-8-0304--0310)
- [Week 9: 03/11 – 03/17](#week-9-0311--0317-spring-break)
- [Week 10: 03/18 – 03/24](#week-10-0318--0324)
- [Week 11: 03/25 – 03/31](#week-11-0325--0331)
- [Week 12: 04/01 – 04/07](#week-12-0401--0407)
- [Week 13: 04/08 – 04/14](#week-13-0408--0414)
- [Week 14: 04/15 – 04/21](#week-14-0415--0421)
- [Week 15: 04/22 – 04/28](#week-15-0422--0428)
- [Week 16: 04/29 – 05/05](#week-16-0429--0505)
- [Week 17: 05/06 – 05/10](#week-17-0506--0510-finals-week)


---

## Week 1: 01/20 – 01/26
We formed our team and are researching about how different types of sensors work. We found some sources describing the effects of caffeine on heart rate and skin conductance, 
and decided to explore the idea of building a caffeine-detecting device after doing thorough research on the subsystems required and sensors required.

Sources : 
## Week 2: 01/27 – 02/02
Worked on further researching the scope of our project and read through sensor datasheets.  

# MAX30102 Heart Rate Sensor - 
I2C Communication, most functionality requires manipulating control and status registers
Built-in FIFO buffer which can be polled at 100 Hz
Requires 1.8V and 3.3V rails 
MAX30102 Datasheet: https://www.analog.com/media/en/technical-documentation/data-sheets/max30102.pdf
<img width="238" alt="image" src="https://github.com/user-attachments/assets/7ff0dfcf-4a93-4707-92df-ecf6edbaf412" />
# GSR Sensor - 
Analog sensor based on skin conductance; outputs voltage proportional to skin resistance.
ADC output from an LM324 op-amp stage.
5V supply with outputs range 0–3.3V.
Sampling at 5-10Hz
Grove GSR Sensor Datasheet: https://files.seeedstudio.com/wiki/Grove-GSR_Sensor/res/Grove-GSR_Sensor_WiKi.pdf
<img width="570" alt="image" src="https://github.com/user-attachments/assets/0fb30d1e-86c4-4693-aa3b-312f784a232e" />

Decided to use STM32 due its ability to capture ADC readings more accurately and its HAL library which supports I2C, ADC and UART. 
MCU Datasheet: https://www.st.com/resource/en/datasheet/stm32l432kb.pdf

## Week 3: 02/03 – 02/09
Made initial web-board post regarding project idea, focusing on subsystem requirements, high-level requirements and success metrics.

## Week 4: 02/10 – 02/16
Worked on Project Proposal with team due this week and submitted on time.

## Week 5: 02/17 – 02/23
Attended Proposal Review session and made notes on feedback.
Started learning about STM32 Cube IDE since I had never worked with it before. Watched tutorials 
on setting up HAL-based boilerplate and its code structure. Installed the software about and started exploring .ioc file initializations etc. 
Started work on the breadboard, effectively collecting ADC Values from the GSR Sensor. Also wrote Python script to plot the ADC readings graphically.

<img width="507" alt="image" src="https://github.com/user-attachments/assets/63efa4ef-dae1-40ae-8484-59ff492658e3" />
<img width="840" alt="image" src="https://github.com/user-attachments/assets/f7f2f63a-d354-45d7-a5da-fb6c014827ce" />

## Week 6: 02/24 – 03/01
Helped with reviewing the block diagram input and output signals.
<img width="550" alt="image" src="https://github.com/user-attachments/assets/63a36d02-a820-4d47-965b-cdf91f30db21" />

## Week 7: 03/02 – 03/08
*Content for Week 7 goes here...*

## Week 8: 03/09 – 03/15
*Content for Week 8 goes here...*

## Week 9: 03/16 – 03/22 (Spring Break)
*Spring Break — no classes*

## Week 10: 03/23 – 03/29
*Content for Week 10 goes here...*

## Week 11: 03/30 – 04/05
*Content for Week 11 goes here...*

## Week 12: 04/06 – 04/12
*Content for Week 12 goes here...*

## Week 13: 04/13 – 04/19
*Content for Week 13 goes here...*

## Week 14: 04/20 – 04/26
*Content for Week 14 goes here...*

## Week 15: 04/27 – 05/03
*Content for Week 15 goes here...*

## Week 16: 05/04 – 05/08 
Prep for Presentations!


