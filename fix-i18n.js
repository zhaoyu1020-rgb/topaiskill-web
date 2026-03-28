const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. 升级翻译引擎：让它遇到 'ja-JP' 时，能自动截取前面的 'ja' 去查字典
code = code.replace(
    /const t = \(key\) => dict\[lang\].*?;/g, 
    "const t = (key) => dict[lang]?.[key] || (lang ? dict[lang.split('-')[0]]?.[key] : null) || dict['zh-CN']?.[key] || key;"
);

// 2. 暴力无视空格，强制替换核心中文
const words = {
    '探索大厅': 'explore', '发布 SKILL': 'publish', '登录 / 注册': 'login',
    '悬赏任务': 'bounties', '控制台 & 我的': 'dashboard', '按行业检索': 'industrySearch',
    '必装 SKILL': 'essential', '效率 SKILL': 'efficiency', '进阶 SKILL': 'advanced',
    '安全 SKILL': 'security', '生活 SKILL': 'life', '开发者': 'developers'
};

for (let [zh, key] of Object.entries(words)) {
    // 使用正则：允许中文两边有任意数量的空格或换行
    let reg = new RegExp(`>\\s*${zh}\\s*<`, 'g');
    code = code.replace(reg, `>{t("${key}")}<`);
}

// 搜索框单独暴力替换
code = code.replace(/placeholder="[^"]*标题、描述或代码[^"]*"/g, 'placeholder={t("searchPlaceholder")}');

fs.writeFileSync('src/App.jsx', code);
console.log("✅ 引擎补丁打入成功！已支持模糊匹配，顽固中文已强制替换！");
