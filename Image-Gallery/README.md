# 📸 React Image Gallery with Pagination

A simple and responsive **React Image Gallery** that fetches images from an external API and displays them with pagination controls (Next / Previous).
This project demonstrates the use of **React Hooks**, **API calls**, and **state management** in a clean UI.

---

## 🚀 Features

* Fetch images from an API
* Pagination (Next / Previous buttons)
* Loading state handling
* Responsive grid layout
* External image links
* Built with modern React (Hooks)

---

## 🛠️ Technologies Used

* **React JS**
* **Axios**
* **Tailwind CSS**
* **Picsum Photos API**

---

## ⚙️ Installation

Follow these steps to run the project locally:

### 1. Clone the repository

```
git clone https://github.com/your-username/react-image-gallery.git
```

### 2. Navigate to the project folder

```
cd react-image-gallery
```

### 3. Install dependencies

```
npm install
```

### 4. Start the development server

```
npm run dev
```

The app will run on:

```
http://localhost:5173
```

---

## 🔌 API Used

This project uses the **Picsum Photos API** to fetch images.

Example API request:

```
https://picsum.photos/v2/list?page=1&limit=12
```

---

## 🎮 How It Works

* The app fetches images using **Axios**
* Images are stored in React state
* When the **Next** or **Previous** button is clicked:

  * The page number updates
  * New images are fetched
  * Loading message is displayed until data arrives
