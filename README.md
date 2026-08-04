# School Application Generator — Backend

Ye ek chhota Node.js/Express server hai jo aapke School Application Generator
frontend ke liye 2 kaam karta hai:

1. Applications ko database (yahan ek simple `applications.json` file) mein save karna
2. Applications ko real SMTP se email karna (Gmail, Outlook, ya koi bhi SMTP provider)

> **Zaroori baat:** Yeh backend Claude.ai ke chat preview ke andar chal rahe React
> app se seedha connect NAHI ho sakta — chat ka preview ek sandboxed environment
> mein chalta hai jo bahar ke localhost/servers ko call nahi kar sakta. Is backend
> ko use karne ke liye aapko frontend code ko apne khud ke computer par ek normal
> React/Vite project banakar chalana hoga, ya kisi hosting (Vercel, Netlify, Render)
> par dono (frontend + backend) deploy karna hoga.

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

`.env` file kholiye aur apni details bhariye:

```
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
```

Gmail use kar rahe hain to normal password kaam nahi karega — Google account
settings mein jaake ek "App Password" banayein (2-step verification on hone
ke baad "App Passwords" option milta hai).

Phir server chalayein:

```bash
npm start
```

Server `http://localhost:5000` par chalega.

## API Endpoints

| Method | Route | Kaam |
|---|---|---|
| GET | `/api/health` | Server chal raha hai ya nahi, check karne ke liye |
| GET | `/api/applications` | Sab saved applications ki list |
| GET | `/api/applications/:id` | Ek application ki detail |
| POST | `/api/applications` | Naya application save karna |
| DELETE | `/api/applications/:id` | Application delete karna |
| POST | `/api/send-email` | Application ko email se bhejna |

### Example: Application save karna

```js
fetch("http://localhost:5000/api/applications", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    template: "leave",
    lang: "hi",
    form: { studentName: "Rahul Kumar", className: "10" },
    fullText: "Poora letter text yahan...",
    studentName: "Rahul Kumar",
  }),
});
```

### Example: Email bhejna

```js
fetch("http://localhost:5000/api/send-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    to: "principal@school.com",
    subject: "Application for Leave",
    text: "Poora letter text yahan...",
  }),
});
```

## Frontend ko is backend se jodna

Agar aap poora project (frontend + backend) khud host karna chahte hain:

1. Is backend ko kisi bhi Node hosting par deploy karo (Render, Railway, Fly.io — sab free tier dete hain)
2. React frontend (jo Claude ne banaya) ko ek normal Vite project mein daalo
   (`npm create vite@latest my-app -- --template react`, phir component file
   `src/App.jsx` mein paste kar do)
3. Frontend mein jahan `Save this application` button hai, wahan upar wale
   `fetch` example jaisa code daal do, jisse data is backend ko jaaye
4. Deploy dono ko (Vercel/Netlify par frontend, Render par backend)

Agar sirf Claude.ai ke andar hi use karna hai (deploy karne ka jhanjhat nahi
chahiye), to jo "Save to history" aur "Send email/WhatsApp" button pehle se
frontend mein hain — wahi kaafi hain, unhe kisi backend ki zaroorat nahi.
