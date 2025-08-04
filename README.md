# 🧠 Grammatical Gender Game
[GitHub](https://github.com/sanuka-w/grammatical-gender-game)

An open source web app to help language learners practice grammatical genders interactively.
Supports multiple languages including *
**German**, **French**, **Greek**, and **Russian**.

## ✨ Features
- Choose from several languages and  **CEFR difficulty levels** (A1, A2, B1, B2, C1, C2)
- Toggle **Impossible mode** to test yourself with **advanced vocabulary**
- **Keyboard shortcuts** for faster practice
- **Instant translations** or fetched live if missing in datasets
- **Responsive dark-themed** interface- Built to be easily extendable with new languages and wordlists

## 📦 Tech Stack
- React + Vite
- Modern JavaScript (ES6+)
- CSS (dark theme, responsive design)

## ⚙ Installation & Running
- Clone the repository and install dependencies:
```bash
npm install
```
- Run the development server:
```bash
npm run dev
```
- Build for production:
```bash
npm run build

## 📄 Data Format
Wordlists are stored as items in an array:
```JSON
[{
"Noun": "Hund",
"gender": "M",
"translation": "Dog",
"level": "A1"
},
...
]
``

## 📝 Motivation
Created because no freely available product offered an open, customizable way to practice grammatical genders interactively across multiple languages.

## 🙏 Special Thanks
**FreeDict.org** for high-quality dictionary data.
**MyMemory API** for translation lookups

## 👤Author
Made by **Sanuka Weerabaddana** to solve a language learning problem.