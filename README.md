![GitHub repo size](https://img.shields.io/github/repo-size/Dull-legend7/chakraa-smart-bus-tracking-system)
# 🚌 Chakraa - Smart Bus Tracking System

A real-time bus tracking application designed to help users track buses efficiently using GPS and IoT integration.

---

## 📌 Project Overview

Chakraa is a smart transportation solution that provides real-time bus location tracking using an ESP32-based GPS module, Firebase backend, and mobile/web applications for users and drivers.

---

## 🧰 Tech Stack

- **Frontend:** React Native  
- **Backend:** Node.js / Express  
- **Database:** Firebase Realtime Database  
- **Hardware:** ESP32 + GPS Module

---

## ⚙️ Features

* 📍 Real-time bus location tracking
* 🧑‍✈️ Driver app for live updates
* 📱 User app to view bus routes and location
* 🔥 Firebase integration for real-time database
* 🌐 Cloud-based backend system
* 🔔 Notifications (if implemented)

---

## 🏗️ System Architecture

* **Hardware:** ESP32 + GPS Module
* **Backend:** Node.js / Express
* **Database:** Firebase Realtime Database
* **Frontend:** React Native / Web App

---

## 📂 Project Structure

```
chakraa-smart-bus-tracking-system/
│── client/        # User application
│── server/        # Backend server
│── driver-app/    # Driver application
│── hardware/      # ESP32 + GPS code
│── README.md
```

---

## 🚀 How It Works

1. GPS module collects real-time coordinates
2. ESP32 sends data to Firebase
3. Backend processes and updates database
4. User app fetches and displays live bus location

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the repository

```
git clone https://github.com/Dull-legend7/chakraa-smart-bus-tracking-system.git
```

### 2️⃣ Install dependencies

```
cd server
npm install
```

### 3️⃣ Run the server

```
npm start
```

---

## 🔐 Environment Variables

Create a `.env` file and add:

```
FIREBASE_API_KEY=your_key
DATABASE_URL=your_url
```

---

## 📸 Screenshots

<img width="401" height="857" alt="screen recording of user app working pic" src="https://github.com/user-attachments/assets/da313809-f36a-4de4-9fa7-cd67faf09932" />

<img width="467" height="861" alt="screens shot of ddriver app working" src="https://github.com/user-attachments/assets/ff0b9082-d8fb-432d-bc62-82cc1682b7e8" />




---

## 🎯 Future Improvements

* Route prediction using AI
* Traffic-based ETA
* Improved UI/UX
* Offline tracking support

---

## 👨‍💻 Contributors

* Athul S
* M.Varshith Reddy
* Rithin Ranjith
* Noaf N
* Nived S

---

## 📜 License

This project is for academic purposes.

---

## 💡 Acknowledgements

* Firebase
* ESP32 Community
* Open-source libraries

---
