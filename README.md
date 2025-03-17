# VandyLostAndFound

We are building a **Lost-And-Found Web Application** to make reporting and finding lost items easier and faster while keeping private information secure.

## **📌 Project Overview**
### **🌟 Purpose**
Our client is the **student body and staff at Vanderbilt University**, who need an efficient way to **manage misplaced items on campus**. Users can:
- **Report lost items** 📢
- **List found items** 🏷️
- **Upload pictures** 🖼️
- **Connect with others** to resolve cases 🔗

### **🛠️ Tech Stack (MERN)**
- **MongoDB** → Database for storing items.
- **Express.js** → Backend framework.
- **React.js** → Frontend user interface.
- **Node.js** → Server environment.
- **Chakra UI** → UI components for a modern look.
- **Zustand** → State management for frontend.

---

## **🚀 How to Run the Project**
### **Project Setup**
1. **Install dependencies**
   ```sh
   npm install
   ```
2. **Start the development server**
   ```sh
   npm run dev
   ```
3. **Navigate to the frontend folder and start the frontend server**
   ```sh
   cd frontend
   npm run dev
   ```
4. **Visit `http://localhost:5173` in your browser.**

---

## **📌 Project Structure**
```
VandyLostAndFound/
│── backend/
│   ├── controllers/
│   │   ├── item.controller.js
│   ├── models/
│   │   ├── item.model.js
│   ├── routes/
│   │   ├── item.router.js
│   ├── config/
│   │   ├── db.js
│   ├── server.js
│
│── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── CreatePage.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ItemCard.jsx
│   │   ├── store/
│   │   │   ├── item.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.html
```

---

## **🚀 Features & Next Steps**
- ✅ **MERN Stack Implementation**
- ✅ **CRUD Operations** (Create, Read, Update, Delete items)
- ✅ **Responsive UI with Chakra UI**
- ✅ **Dark/Light Mode Support**
- 🔜 **Image Upload for Items** 📸
- 🔜 **User Login Authentication** 🔑
- 🔜 **Search & Filter Functionality** (Search items by name or Date Found) 🔍

📢 **Contributors:** Let’s build a powerful lost-and-found platform together! 💡🚀

