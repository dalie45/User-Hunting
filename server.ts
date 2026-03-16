import express, { Request, Response } from "express";
import axios from "axios";

const app = express();
app.use(express.json());

let isRunning = false;
let userToken = "";
let logs: string[] = [];

// --- (دالة الفحص المزدوج المدمجة - لضمان دقة اليوزرات الثلاثية والرباعية) ---
async function checkUsername(name: string, token: string): Promise<string> {
    const config = {
        headers: { 
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 8000
    };

    try {
        // المحاولة الأولى
        const res1 = await axios.post("https://api.rootapp.com/v1/user/check-username", { username: name }, config);
        if (res1.data && res1.data.available === true) return "🎯 AVAILABLE";

        // المحاولة الثانية (التأكيد المزدوج لليوزرات النادرة)
        const res2 = await axios.post("https://api.rootapp.com/v1/user/check-username", { username: name }, config);
        if (res2.data && res2.data.available === true) return "🎯 AVAILABLE";

        return "❌ Taken";
    } catch (error: any) {
        if (error.response && error.response.status === 404) return "🎯 AVAILABLE";
        if (error.response && error.response.status === 403) return "⚠️ Connection Secured (Change IP)";
        return "❌ Offline";
    }
}

app.get("/", (req: Request, res: Response) => {
    res.send(`
        <html>
            <head>
                <title>Hunter Elite v22.1</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
                <style>
                    :root {
                        --bg: #ffffff; --card-bg: #fdfdfd; --text: #1a1a1a; --border: #ececec;
                        --log-bg: #f9fafb; --divider: #eeeeee; --btn-mode-bg: #1e3a8a; --btn-mode-text: #ffffff;
                        --step-bg: #eff6ff; --step-num-bg: #3b82f6;
                    }
                    .dark-theme {
                        --bg: #0b0f19; --card-bg: #111827; --text: #ffffff; --border: #1f2937;
                        --log-bg: #0b0f19; --divider: rgba(255,255,255,0.05); --btn-mode-bg: #ffffff; --btn-mode-text: #001f3f;
                        --step-bg: #1f2937; --step-num-bg: #3b82f6;
                    }
                    
                    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; padding: 40px; margin: 0; transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1); direction: rtl; }
                    .container { max-width: 1200px; margin: auto; }
                    .header { font-weight: 800; font-size: 35px; margin-bottom: 40px; color: #3b82f6; text-align: center; }
                    .grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 40px; align-items: start; }

                    .instruction-section { display: flex; flex-direction: column; gap: 20px; }
                    .step-box { 
                        background: var(--step-bg); padding: 25px; border-radius: 22px; 
                        display: flex; align-items: center; gap: 20px; 
                        border: 1px solid var(--border);
                        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        cursor: pointer;
                    }
                    .step-box:hover { 
                        transform: translateX(-12px); 
                        box-shadow: 0 15px 30px rgba(59, 130, 246, 0.15);
                        border-color: #3b82f6;
                    }
                    .step-number { 
                        min-width: 50px; height: 50px; background: var(--step-num-bg); 
                        color: white; border-radius: 16px; display: flex; 
                        align-items: center; justify-content: center; font-size: 22px; font-weight: 800;
                    }
                    .step-content b { display: block; font-size: 18px; margin-bottom: 5px; color: #3b82f6; }

                    .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 24px; padding: 30px; }
                    input { width: 100%; padding: 18px; background: var(--bg); border: 2px solid var(--border); border-radius: 15px; color: var(--text); margin-bottom: 25px; outline: none; transition: 0.3s; }
                    .btn-group { display: flex; gap: 15px; margin-bottom: 25px; }
                    button { flex: 1; padding: 16px; border-radius: 15px; border: none; font-weight: 700; cursor: pointer; transition: 0.3s; }
                    button:active { transform: scale(0.95); }
                    .btn-start { background: #3b82f6; color: white; }
                    .btn-stop { background: #ef4444; color: white; }
                    .btn-clear { background: #6b7280; color: white; }

                    #logBox { height: 500px; overflow-y: auto; background: var(--log-bg); border-radius: 20px; padding: 20px; border: 1px solid var(--border); }
                    .log-entry { display: flex; align-items: center; padding: 12px; border-bottom: 1px solid var(--divider); font-family: 'JetBrains Mono', monospace; font-size: 13px; direction: ltr; }
                    .v-divider { width: 1px; height: 16px; background: var(--divider); margin: 0 15px; }
                    .log-user { color: #3b82f6; font-weight: 600; }
                    .status-avail { color: #10b981; font-weight: 800; }
                    .status-warn { color: #f59e0b; }

                    @keyframes moonPulse {
                        0% { transform: scale(1); filter: drop-shadow(0 0 0px #3b82f6); }
                        50% { transform: scale(1.15); filter: drop-shadow(0 0 10px #3b82f6); }
                        100% { transform: scale(1); filter: drop-shadow(0 0 0px #3b82f6); }
                    }
                    .mode-toggle {
                        position: fixed; bottom: 30px; left: 30px; background: var(--btn-mode-bg);
                        color: var(--btn-mode-text); padding: 14px 25px; border-radius: 50px; cursor: pointer;
                        box-shadow: 0 8px 30px rgba(0,0,0,0.15); font-weight: 700; display: flex;
                        align-items: center; gap: 12px; border: none; transition: 0.3s;
                    }
                    .mode-toggle:hover .moon-icon { animation: moonPulse 1.5s infinite; }
                    .moon-icon { 
                        font-size: 20px; display: inline-block;
                        -webkit-text-stroke: 1.5px var(--btn-mode-text); color: transparent;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">HUNTER ELITE EXPLORER</div>
                    <div class="grid">
                        <div class="instruction-section">
                            <div class="step-box">
                                <div class="step-number">١</div>
                                <div class="step-content"><b>إدخال التوكن</b><p>ضع رمز التحقق (Token) لبدء الاتصال بالسيرفر.</p></div>
                            </div>
                            <div class="step-box">
                                <div class="step-number">٢</div>
                                <div class="step-content"><b>بدء المهمة</b><p>اضغط إطلاق الفحص لتوليد اليوزرات وفحصها فوراً.</p></div>
                            </div>
                            <div class="step-box" style="background: rgba(245, 158, 11, 0.05);">
                                <div class="step-number" style="background: #f59e0b;">!</div>
                                <div class="step-content"><b style="color:#d97706;">تجاوز الحظر</b><p>غير الـ IP إذا امتلأ السجل باللون البرتقالي.</p></div>
                            </div>
                        </div>

                        <div class="card">
                            <input type="text" id="token" placeholder="Authorization Token...">
                            <div class="btn-group">
                                <button class="btn-start" onclick="startBot()">إطلاق الفحص 🚀</button>
                                <button class="btn-stop" onclick="stopBot()">إيقاف مؤقت</button>
                                <button class="btn-clear" onclick="clearLogs()">تصفير السجل</button>
                            </div>
                            <div id="logBox"></div>
                        </div>
                    </div>
                </div>

                <button class="mode-toggle" onclick="toggleTheme()">
                    <span id="mode-text">Dark Mode</span>
                    <span class="moon-icon">🌙</span>
                </button>

                <script>
                    if (Notification.permission !== 'granted') Notification.requestPermission();
                    const hunterAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

                    function toggleTheme() {
                        document.body.classList.toggle('dark-theme');
                        const isDark = document.body.classList.contains('dark-theme');
                        document.getElementById('mode-text').innerText = isDark ? 'Light Mode' : 'Dark Mode';
                    }

                    function startBot() {
                        const t = document.getElementById('token').value;
                        fetch('/start', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({token: t}) });
                    }
                    function stopBot() { fetch('/stop'); }
                    function clearLogs() { fetch('/clear'); document.getElementById('logBox').innerHTML = ''; }

                    let lastLogSize = 0;
                    setInterval(async () => {
                        try {
                            const r = await fetch('/logs');
                            const d = await r.json();
                            const box = document.getElementById('logBox');
                            
                            if (box && d.length > 0) {
                                if (d.length > lastLogSize) {
                                    const latest = d[d.length - 1];
                                    if (latest.includes('AVAILABLE')) {
                                        hunterAudio.play();
                                        if (Notification.permission === 'granted') {
                                            new Notification('🎯 صيد جديد!', { body: latest.split('->')[0].trim() });
                                        }
                                    }
                                    lastLogSize = d.length;
                                }

                                box.innerHTML = d.map(line => {
                                    const timeMatch = line.match(/\\\[(.*?)\\\]/);
                                    const userMatch = line.match(/@(.*?) ->/);
                                    if(!timeMatch || !userMatch) return "";

                                    const time = timeMatch[1];
                                    const user = userMatch[1];
                                    const status = line.split('-> ')[1];
                                    let sClass = status.includes('AVAILABLE') ? 'status-avail' : (status.includes('Change IP') ? 'status-warn' : '');
                                    
                                    return \`<div class="log-entry">
                                        <span style="color: #6b7280;">\${time}</span>
                                        <div class="v-divider"></div>
                                        <span class="log-user">@\${user}</span>
                                        <div class="v-divider"></div>
                                        <span class="\${sClass}">\${status}</span>
                                    </div>\`;
                                }).join('');
                                
                            }
                        } catch(e) {}
                    }, 1000);
                </script>
            </body>
        </html>
    `);
});

app.post("/start", (req: Request, res: Response): void => {
    userToken = req.body.token;
    if (isRunning) { res.status(400).send("Running"); return; }
    isRunning = true;
    res.send("Started");
    
    (async () => {
        const c = "abcdefghijklmnopqrstuvwxyz";
        const n = "0123456789";
        while (isRunning) {
            const target = c[Math.floor(Math.random()*26)] + c[Math.floor(Math.random()*26)] + c[Math.floor(Math.random()*26)] + n[Math.floor(Math.random()*10)];
            const result = await checkUsername(target, userToken);
            
            // تم ضبط التنسيق ليصبح 12:34:56 PM
            const time = new Date().toLocaleTimeString('en-US', { hour12: true });
            
            logs.push("[" + time + "] @" + target + " -> " + result);
            if (logs.length > 100) logs.shift();
            await new Promise(r => setTimeout(r, 15000 + Math.random() * 5000));
        }
    })();
});

app.get("/stop", (req, res) => { isRunning = false; res.send("Stopped"); });
app.get("/clear", (req, res) => { logs = []; res.send("Cleared"); });
app.get("/logs", (req, res) => { res.json(logs); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🌍 Dashboard: http://localhost:" + PORT));
