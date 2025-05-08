import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ledSimulatorConfig = {
  files: {
    'diagram.json': JSON.stringify({
      version: 1,
      author: 'StartInfo',
      editor: 'wokwi',
      parts: [
        {
          type: 'wokwi-arduino-uno',
          id: 'uno',
          top: 20,
          left: 20
        },
        {
          type: 'wokwi-led',
          id: 'led1',
          top: 100,
          left: 200,
          attrs: { color: 'red' }
        },
        {
          type: 'wokwi-resistor',
          id: 'r1',
          top: 100,
          left: 150,
          attrs: { resistance: '220' }
        }
      ],
      connections: [
        ['uno:13', 'r1:1'],
        ['r1:2', 'led1:A'],
        ['led1:C', 'uno:GND']
      ]
    }),
    'sketch.ino': `
// Pin definitions
const int ledPin = 13;

void setup() {
  // Initialize digital pin as output
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);  // Turn LED on
  delay(1000);                 // Wait 1 second
  digitalWrite(ledPin, LOW);   // Turn LED off
  delay(1000);                 // Wait 1 second
}
    `.trim()
  }
};

const buttonSimulatorConfig = {
  files: {
    'diagram.json': JSON.stringify({
      version: 1,
      author: 'StartInfo',
      editor: 'wokwi',
      parts: [
        {
          type: 'wokwi-arduino-uno',
          id: 'uno',
          top: 20,
          left: 20
        },
        {
          type: 'wokwi-led',
          id: 'led1',
          top: 100,
          left: 200,
          attrs: { color: 'red' }
        },
        {
          type: 'wokwi-resistor',
          id: 'r1',
          top: 100,
          left: 150,
          attrs: { resistance: '220' }
        },
        {
          type: 'wokwi-pushbutton',
          id: 'btn1',
          top: 150,
          left: 100
        }
      ],
      connections: [
        ['uno:13', 'r1:1'],
        ['r1:2', 'led1:A'],
        ['led1:C', 'uno:GND'],
        ['btn1:1.l', 'uno:2'],
        ['btn1:2.l', 'uno:GND']
      ]
    }),
    'sketch.ino': `
const int buttonPin = 2;  // Pin connected to the button
const int ledPin = 13;    // Pin connected to the LED

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);  // Set button pin as input with internal pullup
  pinMode(ledPin, OUTPUT);           // Set LED pin as output
}

void loop() {
  // Read the button state
  int buttonState = digitalRead(buttonPin);

  // Button is active LOW due to pullup resistor
  if (buttonState == LOW) {
    digitalWrite(ledPin, HIGH);  // Turn LED on
  } else {
    digitalWrite(ledPin, LOW);   // Turn LED off
  }
}
    `.trim()
  }
};

async function main() {
  // Create test user if it doesn't exist
  const testUser = await prisma.user.upsert({
    where: { email: 'test@startinfo.com' },
    update: {},
    create: {
      email: 'test@startinfo.com',
      password: await bcrypt.hash('testpass123', 10),
      name: 'Test User',
      role: 'STUDENT',
      verified: true,
      profile: {
        create: {
          bio: 'Test user for development',
        }
      }
    }
  });

  console.log('Test user created:', testUser.email);

  // Create a course
  const course = await prisma.course.create({
    data: {
      title: 'Introduction to Arduino',
      description: 'Learn the basics of Arduino programming and electronics through hands-on projects and interactive simulations.',
      level: 'BEGINNER',
      duration: 240, // 4 hours in minutes
      thumbnail: '/images/courses/arduino-intro.jpg',
      price: 0,
      published: true,
      lessons: {
        create: [
          {
            title: 'Getting Started with Arduino',
            description: 'Learn about the Arduino platform and setup your development environment.',
            content: '# Getting Started with Arduino\n\nIn this lesson, you will learn the basics of Arduino...',
            duration: 30, // in minutes
            order: 1,
            isPublished: true,
            resources: {
              create: [
                {
                  title: 'Arduino IDE Download',
                  url: 'https://www.arduino.cc/en/software',
                  type: 'LINK'
                }
              ]
            },
            simulator: {
              create: {
                config: `
// Pin definitions
const int ledPin = 13;

void setup() {
  // Initialize digital pin as output
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);  // Turn LED on
  delay(1000);                 // Wait 1 second
  digitalWrite(ledPin, LOW);   // Turn LED off
  delay(1000);                 // Wait 1 second
}`,
                components: `{
  "version": 1,
  "author": "StartInfo",
  "editor": "wokwi",
  "parts": [
    {
      "type": "wokwi-arduino-uno",
      "id": "uno",
      "top": 20,
      "left": 20
    },
    {
      "type": "wokwi-led",
      "id": "led1",
      "top": 100,
      "left": 200,
      "attrs": { "color": "red" }
    },
    {
      "type": "wokwi-resistor",
      "id": "r1",
      "top": 100,
      "left": 150,
      "attrs": { "resistance": "220" }
    }
  ],
  "connections": [
    ["uno:13", "r1:1"],
    ["r1:2", "led1:A"],
    ["led1:C", "uno:GND"]
  ]
}`
              }
            }
          },
          {
            title: 'Digital Input/Output',
            description: 'Learn how to control LEDs and read button inputs.',
            content: '# Digital Input/Output\n\nIn this lesson, you will learn about digital inputs and outputs, using LEDs and buttons as examples.',
            duration: 45,
            order: 2,
            isPublished: true,
            resources: {
              create: [
                {
                  title: 'Digital I/O Guide',
                  url: 'https://www.arduino.cc/en/Tutorial/DigitalPins',
                  type: 'LINK'
                }
              ]
            },
            simulator: {
              create: {
                config: `
const int buttonPin = 2;  // Pin connected to the button
const int ledPin = 13;    // Pin connected to the LED

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);  // Set button pin as input with internal pullup
  pinMode(ledPin, OUTPUT);           // Set LED pin as output
}

void loop() {
  // Read the button state
  int buttonState = digitalRead(buttonPin);

  // Button is active LOW due to pullup resistor
  if (buttonState == LOW) {
    digitalWrite(ledPin, HIGH);  // Turn LED on
  } else {
    digitalWrite(ledPin, LOW);   // Turn LED off
  }
}`,
                components: `{
  "version": 1,
  "author": "StartInfo",
  "editor": "wokwi",
  "parts": [
    {
      "type": "wokwi-arduino-uno",
      "id": "uno",
      "top": 20,
      "left": 20
    },
    {
      "type": "wokwi-led",
      "id": "led1",
      "top": 100,
      "left": 200,
      "attrs": { "color": "red" }
    },
    {
      "type": "wokwi-resistor",
      "id": "r1",
      "top": 100,
      "left": 150,
      "attrs": { "resistance": "220" }
    },
    {
      "type": "wokwi-pushbutton",
      "id": "btn1",
      "top": 150,
      "left": 100
    }
  ],
  "connections": [
    ["uno:13", "r1:1"],
    ["r1:2", "led1:A"],
    ["led1:C", "uno:GND"],
    ["btn1:1.l", "uno:2"],
    ["btn1:2.l", "uno:GND"]
  ]
}`
              }
            }
          }
        ]
      }
    }
  });

  console.log('Created introductory Arduino course:', course);

  // Create advanced Arduino course
  const advancedCourse = await prisma.course.create({
    data: {
      title: 'Advanced Arduino Programming',
      description: 'Master advanced Arduino concepts including interrupts, timers, and sensor integration.',
      level: 'ADVANCED',
      thumbnail: '/images/courses/arduino-advanced.jpg',
      duration: 360, // 6 hours
      price: 0,
      published: true,
      lessons: {
        create: [
          {
            title: 'Advanced Input/Output Techniques',
            description: 'Learn about interrupts, timers, and advanced I/O methods.',
            content: '# Advanced I/O Techniques\n\nIn this lesson, you will learn about hardware and software interrupts...',
            duration: 45,
            order: 1,
            isPublished: true,
            resources: {
              create: [
                {
                  title: 'Arduino Interrupts Guide',
                  url: 'https://www.arduino.cc/en/Reference/AttachInterrupt',
                  type: 'LINK'
                }
              ]
            },
            simulator: {
              create: {
                config: JSON.stringify({
                  files: {
                    'sketch.ino': `
const int buttonPin = 2;    // Pin for interrupt
const int ledPin = 13;      // LED pin
volatile bool ledState = false;  // LED state

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  // Attach interrupt to button pin
  attachInterrupt(digitalPinToInterrupt(buttonPin), handleInterrupt, FALLING);
}

void loop() {
  // Main loop stays empty - LED controlled by interrupt
  digitalWrite(ledPin, ledState);
}

// Interrupt Service Routine
void handleInterrupt() {
  ledState = !ledState;  // Toggle LED state
}
                    `.trim()
                  }
                }),
                components: JSON.stringify({
                  parts: [
                    { type: 'wokwi-arduino-uno', id: 'uno', top: 20, left: 20 },
                    { type: 'wokwi-led', id: 'led1', top: 100, left: 200, attrs: { color: 'red' } },
                    { type: 'wokwi-resistor', id: 'r1', top: 100, left: 150, attrs: { resistance: '220' } },
                    { type: 'wokwi-pushbutton', id: 'btn1', top: 150, left: 100 }
                  ],
                  connections: [
                    ['uno:13', 'r1:1'],
                    ['r1:2', 'led1:A'],
                    ['led1:C', 'uno:GND'],
                    ['btn1:1.l', 'uno:2'],
                    ['btn1:2.l', 'uno:GND']
                  ]
                })
              }
            }
          }
        ]
      }
    }
  });

  console.log('Created advanced Arduino course:', advancedCourse);

  // Create IoT course
  const iotCourse = await prisma.course.create({
    data: {
      title: 'Internet of Things with Arduino',
      description: 'Learn to build connected devices and IoT applications using Arduino.',
      level: 'INTERMEDIATE',
      thumbnail: '/images/courses/iot-arduino.jpg',
      duration: 480, // 8 hours
      price: 0,
      published: true,
      lessons: {
        create: [
          {
            title: 'Introduction to IoT',
            description: 'Learn the fundamentals of IoT and connected devices.',
            content: '# Introduction to IoT\n\nIn this lesson, you will learn about IoT fundamentals...',
            duration: 45,
            order: 1,
            isPublished: true,
            resources: {
              create: [
                {
                  title: 'IoT Fundamentals Guide',
                  url: 'https://www.arduino.cc/en/Guide/IoT',
                  type: 'LINK'
                }
              ]
            },
            simulator: {
              create: {
                config: `
// WiFi and MQTT libraries
#include <WiFi.h>
#include <PubSubClient.h>

// WiFi credentials
const char* ssid = "YourNetwork";
const char* password = "YourPassword";

// MQTT Broker settings
const char* mqtt_server = "test.mosquitto.org";
const int mqtt_port = 1883;

// LED pin
const int ledPin = 13;

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
  
  // Connect to MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Publish sensor data every 5 seconds
  static unsigned long lastMsg = 0;
  if (millis() - lastMsg > 5000) {
    lastMsg = millis();
    
    // Read sensor data (simulated)
    int temperature = random(20, 30);
    
    // Create JSON message
    String msg = "{\\"temp\\":" + String(temperature) + "}";
    
    // Publish to MQTT topic
    client.publish("arduino/sensors", msg.c_str());
  }
}

// MQTT callback function
void callback(char* topic, byte* payload, unsigned int length) {
  // Convert payload to string
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  // Control LED based on message
  if (message == "ON") {
    digitalWrite(ledPin, HIGH);
  } else if (message == "OFF") {
    digitalWrite(ledPin, LOW);
  }
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ArduinoClient")) {
      client.subscribe("arduino/control");
    } else {
      delay(5000);
    }
  }
}`,
                components: `{
  "version": 1,
  "author": "StartInfo",
  "editor": "wokwi",
  "parts": [
    {
      "type": "wokwi-arduino-uno",
      "id": "uno",
      "top": 20,
      "left": 20
    },
    {
      "type": "wokwi-led",
      "id": "led1",
      "top": 100,
      "left": 200,
      "attrs": { "color": "red" }
    },
    {
      "type": "wokwi-resistor",
      "id": "r1",
      "top": 100,
      "left": 150,
      "attrs": { "resistance": "220" }
    },
    {
      "type": "wokwi-esp8266",
      "id": "wifi",
      "top": 150,
      "left": 20
    }
  ],
  "connections": [
    ["uno:13", "r1:1"],
    ["r1:2", "led1:A"],
    ["led1:C", "uno:GND"],
    ["uno:TX", "wifi:RX"],
    ["uno:RX", "wifi:TX"],
    ["uno:3.3V", "wifi:VCC"],
    ["uno:GND", "wifi:GND"]
  ]
}`
              }
            }
          }
        ]
      }
    }
  });

  console.log('Created IoT course:', iotCourse);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 