# ECE445_BioSteady

**Team Members:**

Alisha Chakraborty (alishac4)

Asmita Pramanik (asmitap2)

Pranav Nagarajan (pranavn6)


**PROBLEM**

The rigor of student life has not only contributed to our rising stress levels, but also to our dependence on stimulants like caffeine to rapidly increase overall productivity. Furthermore, the wide availability of coffee shops in our school and workplaces make it easy for us to turn to such stimulants, without considering the detrimental combined effects of caffeine and stress on our health. Heightened levels of stress cause various physiological changes such as increased heart rate and skin conductance. Current research suggests that caffeine intake also exhibits similar physiological changes which introduces us to the problem of not being able to differentiate between the two. The ability to differentiate between the two will allow students to make informed decisions about the frequency of their caffeine consumption, consequently contributing to better physical and mental health.


**SOLUTION**

Our proposed solution is to integrate data collected from heart rate and galvanic skin conductance sensors to estimate and notify the user whether they are most likely experiencing physiological changes under stress or caffeine. Doing so will make it easier for them to decide whether it is wise to drink coffee in moments of high stress. 
When we are affected by stress, the adrenaline release in our body immediately triggers a ‘fight or flight’ response, which causes a spike in heart rate. An additional bodily response is also that there are sudden spikes and drops in skin conductance with a general decrease. Under the effects of caffeine, the heart rate does increase but gradually over a couple of minutes. Its effect on skin conductance is that it is normal to low for about 200 seconds and then exhibits a steep increase. Using these facts, we will determine whether the user should consume coffee or not based on their general state of mind.

**SOLUTION COMPONENTS**

**1. Subsystem 1: Biomedical Sensing**

This subsystem will collect the user's physiological data like heart rate, oxygen levels, and skin conductivity and will transmit it to the MCU for data processing.

Heart Rate and Oximeter Sensor 
Sensor : MAX30102

Datasheet: https://www.analog.com/media/en/technical-documentation/data-sheets/max30102.pdf 

Functionality : uses PPG (PhotoPlethysmoGraphy) to measure heart rate and oxygen saturation when processed through an MCU

Communication : I2C

Power Requirements : I2C pull-ups operate on 3.3 V and core operates on 1.8V

Galvanic Skin Response Sensor

Sensor: Elecbee GSR Skin sensor module

Datasheet : https://www.seeedstudio.com/Grove-GSR-sensor-p-1614.html?gad_source=1&gbraid=0AAAAACiAB45royCnyQi5xNgTS40BTYnFL&gclid=CjwKCAiAneK8BhAVEiwAoy2HYbC6TTsLlyUQMAoK6wCHRL13LKu2egu27oheSHQcOb3TPxl8o-h5IxoC6jQQAvD_BwE

Functionality : measures skin conductance to process physiological stress levels, higher voltage output = lower skin resistance which means more sweat

Communication : Analog output voltage changes based on the skin’s conductance
Power Requirements: 3.3V - 5V 

**2. Subsystem 2 : MCU & Power management**

This subsystem will use the biometric data from the sensors for analysis as well as manage communication with external interfaces

Microcontroller : STM32L432KC

Datasheet : https://www.st.com/resource/en/datasheet/stm32l432kc.pdf 

Interfaces : two I2C for MAX30102 and ADC for GSR sensor

Power Supply : 1.71 to 3.6 V for I/Os and 1.62V to 3.6V for ADCs 

Functionality: This MCU will be used to collect the data from the sensors as well as use the USB to UART bridge for frontend web application

Voltage Regulators
LM39401-A : 5V to 3.3V Regulator for MCU and sensors
ASM1117-1.8 : 3.3V to 1.8V Regulator for MAX30102 Cores


**CRITERION FOR SUCCESS**

The system must reliably collect physiological data using the MAX30102 heart sensor and the GSR sensor, ensuring accurate measurement of heart rate, oxygen saturation and skin conductance.These values should be processed in real-time without errors or delays.

The microcontroller (STM32) must integrate the sensor data and differentiate between stress-induced changes (characterized by rapid spikes in heart rate and increased skin conductance) and caffeine-induced changes (characterized by gradual increases in heart rate with stable skin conductance).

Data transmission from the microcontroller to the web application should be a seamless process without any data-loss, ensuring real-time visualization of physiological states.

The web application must display the processed results in a clear, user-friendly format, allowing users to quickly interpret whether their physiological changes are stress- or caffeine-related.

The system must work reliably, right from the collection of data through the sensors to being able to display the results on a web application, ensuring it functions effectively in different scenarios.

The project should be able to let its users make informed decisions about their caffeine intake based on clear, actionable feedback provided by the system.

**REFERENCES**

Villarejo, María Viqueira, Begoña García Zapirain, and Amaia Méndez Zorrilla. 2012. "A Stress Sensor Based on Galvanic Skin Response (GSR) Controlled by ZigBee." Sensors 12 (5): 6075-6101. 
https://doi.org/10.3390/s120506075.
