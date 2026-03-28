const fs = require('fs');

// 1. 创建独立的 9 国语言包文件
const dict = {
  "zh-CN": { explore: "探索大厅", publish: "发布 SKILL", login: "登录 / 注册", bounties: "悬赏任务", dashboard: "控制台 & 我的", searchPlaceholder: "搜索 AI Skill 标题、描述或代码", industrySearch: "按行业检索", essential: "必装 SKILL", efficiency: "效率 SKILL", advanced: "进阶 SKILL", security: "安全 SKILL", life: "生活 SKILL", developers: "开发者", pricing: "授权费", successRate: "成功率", delay: "延迟" },
  "en": { explore: "Explore Hub", publish: "Publish SKILL", login: "Login / Sign Up", bounties: "Bounties", dashboard: "Dashboard", searchPlaceholder: "Search AI Skills, titles or code...", industrySearch: "Browse by Industry", essential: "Essential", efficiency: "Efficiency", advanced: "Advanced", security: "Security", life: "Lifestyle", developers: "Developers", pricing: "Pricing", successRate: "Success Rate", delay: "Latency" },
  "fr": { explore: "Explorer", publish: "Publier SKILL", login: "Connexion", bounties: "Primes", dashboard: "Tableau de bord", searchPlaceholder: "Rechercher des compétences IA...", industrySearch: "Parcourir par industrie", essential: "Essentiel", efficiency: "Efficacité", advanced: "Avancé", security: "Sécurité", life: "Mode de vie", developers: "Développeurs", pricing: "Prix", successRate: "Taux de réussite", delay: "Latence" },
  "es": { explore: "Explorar", publish: "Publicar SKILL", login: "Iniciar sesión", bounties: "Recompensas", dashboard: "Panel", searchPlaceholder: "Buscar habilidades de IA...", industrySearch: "Buscar por industria", essential: "Esencial", efficiency: "Eficiencia", advanced: "Avanzado", security: "Seguridad", life: "Estilo de vida", developers: "Desarrolladores", pricing: "Precio", successRate: "Tasa de éxito", delay: "Latencia" },
  "pt": { explore: "Explorar", publish: "Publicar SKILL", login: "Entrar / Registrar", bounties: "Recompensas", dashboard: "Painel", searchPlaceholder: "Pesquisar habilidades de IA...", industrySearch: "Procurar por setor", essential: "Essencial", efficiency: "Eficiência", advanced: "Avançado", security: "Segurança", life: "Estilo de vida", developers: "Desenvolvedores", pricing: "Preços", successRate: "Taxa de sucesso", delay: "Latência" },
  "de": { explore: "Erkunden", publish: "SKILL veröffentlichen", login: "Anmelden / Registrieren", bounties: "Kopfgelder", dashboard: "Dashboard", searchPlaceholder: "KI-Fähigkeiten suchen...", industrySearch: "Nach Branche durchsuchen", essential: "Unverzichtbar", efficiency: "Effizienz", advanced: "Erweitert", security: "Sicherheit", life: "Lebensstil", developers: "Entwickler", pricing: "Preisgestaltung", successRate: "Erfolgsquote", delay: "Latenz" },
  "ja": { explore: "探索ロビー", publish: "SKILLを公開", login: "ログイン / 登録", bounties: "バウンティ", dashboard: "ダッシュボード", searchPlaceholder: "AI Skillを検索...", industrySearch: "業界別検索", essential: "必須 SKILL", efficiency: "効率化", advanced: "上級 SKILL", security: "セキュリティ", life: "ライフスタイル", developers: "開発者", pricing: "ライセンス料", successRate: "成功率", delay: "レイテンシ" },
  "ko": { explore: "탐색 로비", publish: "SKILL 게시", login: "로그인 / 가입", bounties: "현상금", dashboard: "대시보드", searchPlaceholder: "AI Skill 검색...", industrySearch: "산업별 검색", essential: "필수 SKILL", efficiency: "효율성", advanced: "고급 SKILL", security: "보안", life: "라이프스타일", developers: "개발자", pricing: "가격", successRate: "성공률", delay: "지연 시간" },
  "zh-TW": { explore: "探索大廳", publish: "發布 SKILL", login: "登入 / 註冊", bounties: "懸賞任務", dashboard: "控制台 & 我的", searchPlaceholder: "搜尋 AI Skill 標題、描述或代碼", industrySearch: "按行業檢索", essential: "必裝 SKILL", efficiency: "效率 SKILL", advanced: "進階 SKILL", security: "安全 SKILL", life: "生活 SKILL", developers: "開發者", pricing: "授權費", successRate: "成功率", delay: "延遲" }
};
fs.writeFileSync('src/locales.js', `export const dict = ${JSON.stringify(dict, null, 2)};`);

// 2. 改造 App.jsx
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 注入字典和翻译引擎
if (!code.includes("import { dict } from './locales'")) {
    code = code.replace("import React", "import React\nimport { dict } from './locales';");
}
if (!code.includes("const t = (key)")) {
    code = code.replace("const [lang, setLang] = useState('zh-CN');", "const [lang, setLang] = useState('zh-CN');\n  // 翻译引擎：优先匹配当前语言，找不到则用中文，再找不到则原样输出\n  const t = (key) => dict[lang]?.[key] || dict['zh-CN']?.[key] || key;");
}

// 自动替换主界面的高频词汇
const replaces = {
    '>探索大厅<': '>{t("explore")}<', '>发布 SKILL<': '>{t("publish")}<', '>登录 / 注册<': '>{t("login")}<',
    '>悬赏任务<': '>{t("bounties")}<', '>控制台 & 我的<': '>{t("dashboard")}<', '>按行业检索<': '>{t("industrySearch")}<',
    'placeholder="搜索 AI Skill 标题、描述或代码"': 'placeholder={t("searchPlaceholder")}',
    '>必装 SKILL<': '>{t("essential")}<', '>效率 SKILL<': '>{t("efficiency")}<', '>进阶 SKILL<': '>{t("advanced")}<',
    '>安全 SKILL<': '>{t("security")}<', '>生活 SKILL<': '>{t("life")}<', '>开发者<': '>{t("developers")}<'
};

for (const [zh, i18n] of Object.entries(replaces)) {
    code = code.split(zh).join(i18n);
}

// 统一修复可能存在的不规范语言代码（把你在界面上选择的名称映射到字典代码）
code = code.replace(/setLang\('English'\)/g, "setLang('en')")
           .replace(/setLang\('日本語'\)/g, "setLang('ja')")
           .replace(/setLang\('Français'\)/g, "setLang('fr')")
           .replace(/setLang\('Español'\)/g, "setLang('es')")
           .replace(/setLang\('Português'\)/g, "setLang('pt')")
           .replace(/setLang\('Deutsch'\)/g, "setLang('de')")
           .replace(/setLang\('한국어'\)/g, "setLang('ko')")
           .replace(/setLang\('繁體中文'\)/g, "setLang('zh-TW')")
           .replace(/setLang\('简体中文'\)/g, "setLang('zh-CN')");

fs.writeFileSync('src/App.jsx', code);
console.log("✅ 9国语言包生成完毕，主架构动态变量替换成功！");
