# Google Docs Clone (MERN Stack)

![Screenshot](https://raw.githubusercontent.com/1-abesh-1/google-docs-clone/refs/heads/main/Screenshot%202025-03-06%20170006.png)
![Screenshot](https://raw.githubusercontent.com/1-abesh-1/google-docs-clone/refs/heads/main/Screenshot%202025-03-06%20170023.png)

## 📌 Overview
This is a **Google Docs Clone** built using the **MERN Stack (MongoDB, Express.js, React, Node.js)**. It allows users to create, edit, and collaborate on documents in real-time, just like Google Docs.

## 🚀 Features
- ✍️ **Real-time Collaboration** using **Socket.io**
- 🔐 **User Authentication** with JWT
- 📄 **Document Autosave** in **MongoDB**
- 🗄️ **Document History** and Persistence
- 🌐 **Responsive UI** for better user experience

## 🛠 Tech Stack
### Frontend:
- React.js (Vite for fast development)
- Quill.js (for rich text editing)
- Tailwind CSS (for styling)

### Backend:
- Node.js & Express.js
- MongoDB (with Mongoose)
- Socket.io (for real-time document collaboration)
- JWT Authentication

## 📂 Folder Structure
```
/google-docs-clone
 ├── client    # React frontend
 ├── server    # Node.js & Express backend
 ├── README.md # Documentation
```

## 🛠 Installation & Setup
### 1️⃣ Clone the repository
```sh
git clone https://github.com/1-abesh-1/google-docs-clone.git
cd google-docs-clone
```

### 2️⃣ Install dependencies
```sh
npm install
```

### 3️⃣ Set up environment variables
Create a `.env` file in the **server** folder and add:
```
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret_key
```

### 4️⃣ Run the project
```sh
npm start
```

## 🚀 Usage
1. **Sign in** using JWT authentication.
2. **Create a new document** or **edit an existing one**.
3. **Collaborate in real-time** with multiple users.
4. **Changes are automatically saved** to MongoDB.

## 📌 Contributing
Feel free to fork this repo and submit pull requests if you'd like to improve this project!

## 📜 License
This project is licensed under the **MIT License**.

## 💡 Author
**[Abesh](https://github.com/1-abesh-1)**

---
🌟 **Star this repo if you find it useful!** 🌟
