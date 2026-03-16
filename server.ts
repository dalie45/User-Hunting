import express, { Request, Response } from "express";
import axios from "axios";

const app = express();
app.use(express.json());

let isRunning = false;
let userToken = "";
let logs: string[] = [];

async function checkUsername(name: string, token: string): Promise<string> {
    const config = {
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        timeout: 8000
    };
    try {
        const res1 = await axios.post("https://api.rootapp.com/v1/user/check-username", { username: name }, config);
        if (res1.data && res1.data.available === true) return "AVAILABLE";
        const res2 = await axios.post("https://api.rootapp.com/v1/user/check-username", { username: name }, config);
        if (res2.data && res2.data.available === true) return "AVAILABLE";
        return "Taken";
    } catch (error: any) {
        if (error.response && error.response.status === 404) return "AVAILABLE";
        if (error.response && error.response.status === 403) return "Connection Secured (Change IP)";
        return "Offline";
    }
}

const HTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Hunter Elite v22.1</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg:#ffffff;--card-bg:#fdfdfd;--text:#1a1a1a;--border:#ececec;
            --log-bg:#f9fafb;--divider:#eeeeee;--btn-bg:#1e3a8a;--btn-text:#ffffff;--step-bg:#eff6ff;
        }
        .dark{--bg:#0b0f19;--card-bg:#111827;--text:#ffffff;--border:#1f2937;--log-bg:#0b0f19;--divider:rgba(255,255,255,0.05);--btn-bg:#ffffff;--btn-text:#001f3f;--step-bg:#1f2937;}
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;transition:0.5s;direction:rtl;min-height:100vh;}
        .navbar{position:fixed;top:20px;left:20px;display:flex;gap:12px;z-index:100;}
        .nav-btn{background:var(--btn-bg);color:var(--btn-text);padding:12px 22px;border-radius:50px;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,0.15);font-weight:700;display:flex;align-items:center;gap:10px;border:none;transition:0.3s;font-size:14px;}
        .nav-btn:hover{transform:translateY(-3px);}
        .nav-btn.active{background:#3b82f6;color:white;}
        .page{display:none;padding:100px 40px 40px;max-width:1200px;margin:auto;}
        .page.active{display:block;animation:fadeIn 0.4s ease;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .landing-hero{text-align:center;padding:60px 0 80px;}
        .landing-hero h1{font-size:52px;font-weight:800;color:#3b82f6;margin-bottom:20px;}
        .landing-hero p{font-size:20px;color:#6b7280;max-width:600px;margin:0 auto 50px;line-height:1.7;}
        .cta-btn{background:#3b82f6;color:white;padding:18px 50px;border-radius:50px;border:none;font-size:18px;font-weight:700;cursor:pointer;transition:0.3s;box-shadow:0 10px 30px rgba(59,130,246,0.3);}
        .cta-btn:hover{transform:translateY(-4px);}
        .features{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:60px;}
        .feature-card{background:var(--card-bg);border:1px solid var(--border);border-radius:24px;padding:30px;text-align:center;transition:0.3s;}
        .feature-card:hover{transform:translateY(-6px);border-color:#3b82f6;}
        .feature-icon{font-size:40px;margin-bottom:16px;display:block;}
        .feature-card h3{font-size:18px;font-weight:700;color:#3b82f6;margin-bottom:10px;}
        .feature-card p{font-size:14px;color:#6b7280;line-height:1.6;}
        .guide-title{font-size:32px;font-weight:800;color:#3b82f6;margin-bottom:40px;text-align:center;}
        .steps{display:flex;flex-direction:column;gap:20px;max-width:700px;margin:0 auto;}
        .step-box{background:var(--step-bg);padding:25px 30px;border-radius:22px;display:flex;align-items:center;gap:20px;border:1px solid var(--border);transition:all 0.3s;}
        .step-box:hover{transform:translateX(-10px);border-color:#3b82f6;}
        .step-number{min-width:52px;height:52px;background:#3b82f6;color:white;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;}
        .step-content b{display:block;font-size:17px;margin-bottom:6px;color:#3b82f6;}
        .step-content p{font-size:14px;color:#6b7280;line-height:1.6;}
        .token-steps{background:var(--card-bg);border:1px solid var(--border);border-radius:22px;padding:30px;margin-top:30px;max-width:700px;margin-inline:auto;}
        .token-steps h3{font-size:18px;font-weight:700;color:#3b82f6;margin-bottom:20px;text-align:center;}
        .token-step{display:flex;align-items:flex-start;gap:14px;margin-bottom:16px;font-size:14px;color:#6b7280;line-height:1.6;}
        .token-step span{min-width:28px;height:28px;background:#3b82f6;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;}
        .header{font-weight:800;font-size:35px;margin-bottom:40px;color:#3b82f6;text-align:center;}
        .grid{display:grid;grid-template-columns:1fr 1.5fr;gap:40px;align-items:start;}
        .instruction-section{display:flex;flex-direction:column;gap:20px;}
        .card{background:var(--card-bg);border:1px solid var(--border);border-radius:24px;padding:30px;}
        input{width:100%;padding:18px;background:var(--bg);border:2px solid var(--border);border-radius:15px;color:var(--text);margin-bottom:25px;outline:none;transition:0.3s;font-family:'JetBrains Mono',monospace;font-size:13px;}
        .btn-group{display:flex;gap:15px;margin-bottom:25px;}
        button.action{flex:1;padding:16px;border-radius:15px;border:none;font-weight:700;cursor:pointer;transition:0.3s;}
        button.action:active{transform:scale(0.95);}
        .btn-start{background:#3b82f6;color:white;}
        .btn-stop{background:#ef4444;color:white;}
        .btn-clear{background:#6b7280;color:white;}
        #logBox{height:500px;overflow-y:auto;background:var(--log-bg);border-radius:20px;padding:20px;border:1px solid var(--border);}
        .log-entry{display:flex;align-items:center;padding:12px;border-bottom:1px solid var(--divider);font-family:'JetBrains Mono',monospace;font-size:13px;direction:ltr;}
        .v-divider{width:1px;height:16px;background:var(--divider);margin:0 15px;}
        .log-user{color:#3b82f6;font-weight:600;}
        .status-avail{color:#10b981;font-weight:800;}
        .status-warn{color:#f59e0b;}
    </style>
</head>
<body>
    <div class="navbar">
        <button class="nav-btn active" id="btn-landing" onclick="showPage('landing')">🏠 الرئيسية</button>
        <button class="nav-btn" id="btn-guide" onclick="showPage('guide')">📖 الدليل</button>
        <button class="nav-btn" id="btn-app" onclick="showPage('app')">🚀 إطلاق</button>
        <button class="nav-btn" onclick="toggleTheme()">🌙 <span id="mode-text">Dark Mode</span></button>
    </div>

    <div class="page active" id="page-landing">
        <div class="landing-hero">
            <h1>HUNTER ELITE</h1>
            <p>أداة ذكية للبحث عن أسماء المستخدمين المتاحة على منصة Rootapp بشكل تلقائي وسريع</p>
            <button class="cta-btn" onclick="showPage('guide')">ابدأ الآن ←</button>
        </div>
        <div class="features">
            <div class="feature-card"><span class="feature-icon">⚡</span><h3>فحص تلقائي</h3><p>يقوم بتوليد أسماء عشوائية وفحصها تلقائياً بشكل مستمر دون تدخل منك</p></div>
            <div class="feature-card"><span class="feature-icon">🔔</span><h3>إشعارات فورية</h3><p>يُنبهك فوراً عند إيجاد اسم متاح عبر إشعارات المتصفح وصوت تنبيه</p></div>
            <div class="feature-card"><span class="feature-icon">🎨</span><h3>واجهة أنيقة</h3><p>واجهة سهلة الاستخدام تدعم الوضع الليلي وتعرض النتائج بشكل واضح</p></div>
        </div>
    </div>

    <div class="page" id="page-guide">
        <div class="guide-title">كيفية الاستخدام</div>
        <div class="steps">
            <div class="step-box"><div class="step-number">١</div><div class="step-content"><b>افتح Rootapp</b><p>قم بتنزيل تطبيق Rootapp وتسجيل الدخول من الموقع الرسمي rootapp.com</p></div></div>
            <div class="step-box"><div class="step-number">٢</div><div class="step-content"><b>احصل على التوكن</b><p>اذهب لإعدادات حسابك ← Developer ← انسخ الـ Bearer Token</p></div></div>
            <div class="step-box"><div class="step-number">٣</div><div class="step-content"><b>أطلق الفحص</b><p>اضغط على زر "إطلاق" في الأعلى، ألصق التوكن واضغط "إطلاق الفحص"</p></div></div>
            <div class="step-box" style="border-color:#f59e0b;"><div class="step-number" style="background:#f59e0b;">!</div><div class="step-content"><b style="color:#d97706;">تغيير الـ IP عند الحجب</b><p>إذا ظهرت رسالة "Change IP" قم بتغيير الـ VPN أو الشبكة</p></div></div>
        </div>
        <div class="token-steps">
            <h3>كيف أحصل على التوكن؟</h3>
            <div class="token-step"><span>1</span><p>افتح تطبيق Rootapp على جهازك</p></div>
            <div class="token-step"><span>2</span><p>اضغط على صورتك الشخصية في أعلى اليسار</p></div>
            <div class="token-step"><span>3</span><p>اذهب إلى Settings ثم Developer</p></div>
            <div class="token-step"><span>4</span><p>انسخ الـ Bearer Token وألصقه في حقل التوكن</p></div>
            <div style="text-align:center;margin-top:24px;"><button class="cta-btn" onclick="showPage('app')">جاهز — انطلق 🚀</button></div>
        </div>
    </div>

    <div class="page" id="page-app">
        <div class="header">HUNTER ELITE EXPLORER</div>
        <div class="grid">
            <div class="instruction-section">
                <div class="step-box"><div class="step-number">١</div><div class="step-content"><b>إدخال التوكن</b><p>ضع رمز التحقق (Token) لبدء الاتصال بالسيرفر.</p></div></div>
                <div class="step-box"><div class="step-number">٢</div><div class="step-content"><b>بدء المهمة</b><p>اضغط إطلاق الفحص لتوليد اليوزرات وفحصها فوراً.</p></div></div>
                <div class="step-box" style="background:rgba(245,158,11,0.05);"><div class="step-number" style="background:#f59e0b;">!</div><div class="step-content"><b style="color:#d97706;">تجاوز الحظر</b><p>غير الـ IP إذا امتلأ السجل باللون البرتقالي.</p></div></div>
            </div>
            <div class="card">
                <input type="text" id="token" placeholder="Authorization Token...">
                <div class="btn-group">
                    <button class="action btn-start" onclick="startBot()">إطلاق الفحص 🚀</button>
                    <button class="action btn-stop" onclick="stopBot()">إيقاف مؤقت</button>
                    <button class="action btn-clear" onclick="clearLogs()">تصفير السجل</button>
                </div>
                <div id="logBox"></div>
            </div>
        </div>
    </div>

    <script>
        if (Notification.permission !== 'granted') Notification.requestPermission();
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

        function showPage(name) {
            document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
            document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
            document.getElementById('page-' + name).classList.add('active');
            var btn = document.getElementById('btn-' + name);
            if (btn) btn.classList.add('active');
        }

        function toggleTheme() {
            document.body.classList.toggle('dark');
            var isDark = document.body.classList.contains('dark');
            document.getElementById('mode-text').innerText = isDark ? 'Light Mode' : 'Dark Mode';
        }

        function startBot() {
            var t = document.getElementById('token').value;
            fetch('/start', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({token: t}) });
        }
        function stopBot() { fetch('/stop'); }
        function clearLogs() { fetch('/clear'); document.getElementById('logBox').innerHTML = ''; }

        var lastSize = 0;
        setInterval(function() {
            fetch('/logs').then(function(r) { return r.json(); }).then(function(d) {
                var box = document.getElementById('logBox');
                if (!box || d.length === 0) return;
                if (d.length > lastSize) {
                    var latest = d[d.length - 1];
                    if (latest.includes('AVAILABLE')) {
                        audio.play();
                        if (Notification.permission === 'granted') new Notification('صيد جديد!', { body: latest });
                    }
                    lastSize = d.length;
                }
                box.innerHTML = d.map(function(line) {
				var scrollPos = box.scrollTop;
                    var tm = line.match(/\[(.*?)\]/);
                    var um = line.match(/@(.*?) ->/);
                    if (!tm || !um) return '';
                    var status = line.split('-> ')[1] || '';
                    var cls = status.includes('AVAILABLE') ? 'status-avail' : (status.includes('Change IP') ? 'status-warn' : '');
                    return '<div class="log-entry"><span style="color:#6b7280">' + tm[1] + '</span><div class="v-divider"></div><span class="log-user">@' + um[1] + '</span><div class="v-divider"></div><span class="' + cls + '">' + status + '</span></div>';
                }).join('');
				box.scrollTop = scrollPos;
            }).catch(function() {});
        }, 1000);
    </script>
</body>
</html>
`;

app.get("/", (req: Request, res: Response) => {
    res.send(HTML);
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
            const time = new Date().toLocaleTimeString("en-US", { hour12: true });
            logs.push("[" + time + "] @" + target + " -> " + result);
            if (logs.length > 100) logs.shift();
            await new Promise(resolve => setTimeout(resolve, 15000 + Math.random() * 5000));
        }
    })();
});

app.get("/stop", (req, res) => { isRunning = false; res.send("Stopped"); });
app.get("/clear", (req, res) => { logs = []; res.send("Cleared"); });
app.get("/logs", (req, res) => { res.json(logs); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Dashboard: http://localhost:" + PORT));
