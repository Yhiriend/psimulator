/* eslint-disable prettier/prettier */
export const PROCESSES = [
  {
    id: 101,
    name: "Catálogo 1",
    processes: [
      {
        id: 1,
        PID: 1234,
        name: "AnyDesk",
        user: "usuario1",
        description: "AnyDesk Remote Desktop", //22
        priority: "alta",
      },
      {
        id: 2,
        PID: 5678,
        name: "Chrome",
        user: "usuario2",
        description: "Google Chrome Web Browser", //25
        priority: "media",
      },
      {
        id: 3,
        PID: 91011,
        name: "WhatsApp",
        user: "usuario3",
        description: "WhatsApp Messenger", //18
        priority: "alta",
      },
      {
        id: 4,
        PID: 121314,
        name: "VLC",
        user: "usuario1",
        description: "VLC Media Player", //16
        priority: "baja",
      },
      {
        id: 5,
        PID: 151617,
        name: "Notepad",
        user: "usuario2",
        description: "Windows Notepad Text Editor", //27
        priority: "media",
      },
    ],
  },
  {
    id: 102,
    name: "Catálogo 2",
    processes: [
      {
        id: 7,
        PID: 212223,
        name: "Discord",
        user: "usuario1",
        description: "Discord Voice and Text Chat",
        priority: "media",
      },
      {
        id: 8,
        PID: 242526,
        name: "Telegram",
        user: "usuario2",
        description: "Telegram Messenger",
        priority: "alta",
      },
      {
        id: 9,
        PID: 272829,
        name: "Zoom",
        user: "usuario3",
        description: "Zoom Video Conferencing",
        priority: "baja",
      },
      {
        id: 10,
        PID: 303132,
        name: "Skype",
        user: "usuario1",
        description: "Skype Video and Voice Calls",
        priority: "media",
      },
    ],
  },
];
