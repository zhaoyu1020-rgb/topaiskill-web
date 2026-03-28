import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Globe, ThumbsUp, Share2, Download, Code, Shield, 
  Terminal, Award, Cpu, Briefcase, DollarSign, Activity, 
  BookOpen, Heart, Factory, Video, Zap, User, PlusCircle, CheckCircle2,
  X, UploadCloud, Crown, ChevronDown, Copy, ExternalLink,
  LogOut, Wallet, CreditCard, MessageCircle, Chrome, Bookmark, MessageSquare,
  Bell, ArrowLeft, Play, FileJson, Star, Github, Link as LinkIcon, Server, FileText,
  ShieldCheck, AlertTriangle, Key, Scale, Check
} from 'lucide-react';

// ==========================================
// 0. 全局 Toast 提示系统 (配合 Tailwind 动画)
// ==========================================
const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
  const bg = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-emerald-600' : 'bg-slate-800';
  return (
    <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 ${bg} text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-[200] animate-fade-in-down`}>
      {type === 'error' ? <AlertTriangle size={18} /> : type === 'success' ? <CheckCircle2 size={18} /> : <Bell size={18} />}
      <span className="text-sm font-bold">{message}</span>
    </div>
  );
};

// ==========================================
// 1. 多语言字典与动态货币格式化
// ==========================================
const translations = {
  'en': { search: 'Search AI Skills...', login: 'Login / Register', userCenter: 'Dashboard', balance: 'Balance', revenue: 'Revenue', install: 'Get / Install', free: 'Free' },
  'zh-CN': { search: '搜索 AI Skill 标题、描述或作者...', login: '登录 / 注册', userCenter: '个人中心', balance: '消费余额', revenue: '累计收益', install: '获取 / 安装', free: '免费' }
};

const languages = [
  { code: 'en', name: 'English' }, { code: 'fr', name: 'Français' }, { code: 'es', name: 'Español' }, 
  { code: 'pt', name: 'Português' }, { code: 'de', name: 'Deutsch' }, { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' }, { code: 'zh-CN', name: '简体中文' }, { code: 'zh-TW', name: '繁體中文' }
];

const getCurrencyConfig = (langCode) => {
  if (langCode.startsWith('zh')) return { sym: '¥', rate: 7.2, noDec: false };
  if (langCode === 'ja') return { sym: '¥', rate: 150, noDec: true };
  if (langCode === 'ko') return { sym: '₩', rate: 1300, noDec: true };
  if (['fr', 'de', 'es', 'pt'].includes(langCode)) return { sym: '€', rate: 0.92, noDec: false };
  return { sym: '$', rate: 1, noDec: false }; 
};

const formatMoney = (usdAmount, langCode) => {
  const { sym, rate, noDec } = getCurrencyConfig(langCode);
  const converted = usdAmount * rate;
  return noDec ? `${sym}${Math.round(converted).toLocaleString()}` : `${sym}${converted.toFixed(2)}`;
};

const formatCost = (usdCost, langCode) => {
  const { sym, rate } = getCurrencyConfig(langCode);
  return `${sym}${(usdCost * rate).toFixed(4)}`;
};

const parseDownloads = (dlStr) => {
  if (dlStr.endsWith('M')) return parseFloat(dlStr) * 1000000;
  if (dlStr.endsWith('K')) return parseFloat(dlStr) * 1000;
  return parseInt(dlStr);
};

// ==========================================
// 2. 数据架构: 快捷分类, 8大行业 & 模拟数据
// ==========================================
const topCategories = [
  { id: 'must-have', name: '必装 SKILL', icon: <Download size={18} /> },
  { id: 'efficiency', name: '效率 SKILL', icon: <Zap size={18} /> },
  { id: 'advanced', name: '进阶 SKILL', icon: <Terminal size={18} /> },
  { id: 'security', name: '安全 SKILL', icon: <Shield size={18} /> },
  { id: 'life', name: '生活 SKILL', icon: <Heart size={18} /> }
];

const industries = [
  { id: 'ind-1', name: '1. 专业服务与销售', icon: <Briefcase size={18} />, subCats: ['法务与合规', '财务与审计', '管理咨询', '销售自动化'] },
  { id: 'ind-2', name: '2. 金融与资本市场', icon: <DollarSign size={18} />, subCats: ['银行业', '投资与资管', 'Web3 & 数字资产', '保险精算'] },
  { id: 'ind-3', name: '3. IT 与互联网', icon: <Code size={18} />, subCats: ['数据中心', '软件开发', '安全加固', 'Agent 优化', '专业软件'] },
  { id: 'ind-4', name: '4. 教育与学术', icon: <BookOpen size={18} />, subCats: ['高等教育', '基础 K12', '职业培训', '学术研究'] },
  { id: 'ind-5', name: '5. 医疗与制药', icon: <Activity size={18} />, subCats: ['生物制药', '医疗器械', '智慧医院', '临床数据'] },
  { id: 'ind-6', name: '6. 制造业', icon: <Cpu size={18} />, subCats: ['半导体', '面板制造', '消费电子', '汽车及零部件', '航空航天', '新能源与光伏'] },
  { id: 'ind-7', name: '7. 基础工业制造', icon: <Factory size={18} />, subCats: ['化工', '石油石化', '电力能源', '钢铁冶炼', '矿产开采', '交通物流'] },
  { id: 'ind-8', name: '8. 广告影视与传媒', icon: <Video size={18} />, subCats: ['新闻资讯', '广告营销', '影视后期', 'AI 绘画', 'AI 音乐'] }
];

const mockSkills = [
  { id: 101, title: 'Agent 基础联网检索', desc: '赋予 Agent 突破截止日期，实时联网搜索的能力。', author: 'TopAI_Core', topCat: 'must-have', industry: 'ind-3', subCat: '数据中心', likes: 15420, success: '99.8%', latency: '1.2s', cost: 0.001, price: 0, downloads: '1.2M', versions: ['v2.1.0', 'v2.0.0', 'v1.5.0'], 
    readme: "## 高并发联网检索\n内置 gVisor 隔离层确保安全。使用 `client.invoke(skill_id='101')` 即可获取 Google 搜索结果 JSON 结构。",
    reviews: [ { user: 'DevKing', rating: 5, date: '2026-03-20', verified: true, text: '速度极快，防封禁做得很好。' } ]
  },
  { id: 102, title: '智能日程规划引擎', desc: '一键读取日历并自动安排高优任务。', author: 'TimeHacker', topCat: 'efficiency', industry: 'ind-3', subCat: '专业软件', likes: 8900, success: '96.5%', latency: '0.8s', cost: 0.002, price: 0, downloads: '34K', versions: ['v1.2.0'], readme: "支持 Google Calendar 与 Outlook API。", reviews: [] },
  { id: 103, title: 'Python 沙箱执行器', desc: '在隔离的 Docker 容器中安全执行生成的代码。', author: 'SecOps_Ninja', topCat: 'security', industry: 'ind-3', subCat: '安全加固', likes: 12050, success: '99.9%', latency: '2.5s', cost: 0.010, price: 0, downloads: '89K', versions: ['v3.0.1'], readme: "内置常用库。断网环境运行，绝对安全。", reviews: [] },
  { id: 104, title: '开源 3D 打印智能切片', desc: '自动分析 STL 模型并生成最佳的 3D 打印 G-code。', author: 'MakerPro', topCat: 'life', industry: 'ind-6', subCat: '消费电子', likes: 4300, success: '92.1%', latency: '5.0s', cost: 0.050, price: 0, downloads: '12K', versions: ['v1.0.0'], readme: "创客必备，自动优化支撑结构。", reviews: [] },
  { id: 105, title: '雅思 7.5 每日听写引擎', desc: '自动生成纯正口音听写音频，强制逐个字母验证错词。', author: 'EduGeek', topCat: 'life', industry: 'ind-4', subCat: '基础 K12', likes: 6500, success: '98.5%', latency: '0.5s', cost: 0.005, price: 0, downloads: '18K', versions: ['v1.1.0'], readme: "## 英语听写陪练\n专为追求雅思高分设计。告别眼高手低，必须动手拼写。自动记录错词本，视错误为查缺补漏。", reviews: [] },
  { id: 106, title: '硬件极客电路仿真 Agent', desc: '上传草图，自动仿真电路逻辑并生成 PCB 走线建议。', author: 'Hardware_Nerd', topCat: 'advanced', industry: 'ind-6', subCat: '消费电子', likes: 5200, success: '95.2%', latency: '3.5s', cost: 0.020, price: 0, downloads: '8.5K', versions: ['v2.1.0'], readme: "支持 SPICE 仿真模型，极客硬件 DIY 必备利器。", reviews: [] },
  { id: 201, title: '穿透式异常财务审计', desc: '接入 ERP 数据库，自动对比凭证与流水，标记违规交易。', author: 'AuditAI', industry: 'ind-1', subCat: '财务与审计', likes: 3200, success: '94.2%', latency: '4.5s', cost: 0.150, price: 199.00, downloads: '1.2K', versions: ['v1.0.2', 'v1.0.0'],
    readme: "## 财务审计大模型\n基于 50 万份真实审计底稿微调。警告：此模型需通过 KMS 注入包含高权限的只读数据库 Token。",
    reviews: [ { user: 'CFO_Mike', rating: 4, date: '2026-03-22', verified: true, text: '跨期费用识别率很高，但处理超大 Excel 时有 OOM 问题，期待 v1.1 修复。' } ]
  },
  { id: 401, title: 'K8s 集群日志异常诊断', desc: '实时读取 Kubernetes 日志流，预测并定位微服务崩溃节点。', author: 'DevOps_Master', industry: 'ind-3', subCat: '数据中心', likes: 6700, success: '93.8%', latency: '1.5s', cost: 0.020, price: 0, downloads: '45K', versions: ['v1.5.0'], readme: "降低 MTTR 核心组件。", reviews: [] },
  { id: 701, title: '边缘缺陷视觉检测模型', desc: '微秒级识别液晶面板及工业产品表面的划痕与漏光点。', author: 'VisionAI_Edge', industry: 'ind-6', subCat: '面板制造', likes: 11200, success: '99.9%', latency: '0.05s', cost: 0.005, price: 499.00, downloads: '800', versions: ['v3.0.0 (Latest)', 'v2.5.2'],
    readme: "## 工业视觉检测\n支持 C++ 与 Python 混合推理。模型采用端到端加密，您的检测图像不会被用于二次训练。",
    reviews: []
  }
];

const mockBounties = [
  { id: 'b-1', title: '开发医疗影像自动脱敏 Skill', amount: 5000, req: '需移除 DICOM 文件中的所有患者隐私元数据及影像上的文字烧录', status: 'open', tags: ['医疗与制药', '计算机视觉'] },
  { id: 'b-2', title: 'Web3 链上数据追踪监控 Agent', amount: 12000, req: '监控异常大额转账并推送到 Telegram', status: 'escrowed', tags: ['金融与资本市场', 'Web3'] },
];

const mockNotifications = [
  { id: 1, text: "您收藏的『K8s 日志诊断』发布了 v2.0 安全更新。", time: "2 小时前", isRead: false },
  { id: 2, text: "平台赠送您 $5.00 新手沙盒测试基金。", time: "1 天前", isRead: true },
];

// ==========================================
// 3. 主应用组件 App
// ==========================================
export default function App() {
  const [lang, setLang] = useState('zh-CN');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const t = translations[lang] || translations['en'];
  
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => setToast({ message, type });

  const [activeTab, setActiveTab] = useState('explore'); 
  const [activeTopCat, setActiveTopCat] = useState(null);
  const [activeIndustry, setActiveIndustry] = useState(industries[0].id);
  const [activeSubCat, setActiveSubCat] = useState('All');
  
  const [searchQuery, setSearchQuery] = useState(''); 
  const [viewingSkill, setViewingSkill] = useState(null); 
  const [viewingCreator, setViewingCreator] = useState(null); 
  const [activeDetailTab, setActiveDetailTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [authModalMode, setAuthModalMode] = useState(null); 
  const [loginForm, setLoginForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [isHumanVerified, setIsHumanVerified] = useState(false);

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedSkillToBuy, setSelectedSkillToBuy] = useState(null);
  const [financeModal, setFinanceModal] = useState({ isOpen: false, type: 'deposit' }); 
  const [isBiddingModalOpen, setIsBiddingModalOpen] = useState(false);
  const [biddingBounty, setBiddingBounty] = useState(null);

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishStep, setPublishStep] = useState('form');
  const [publishForm, setPublishForm] = useState({ title: '', assetType: 'config', priceModel: 'free', price: 9.9 });

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [playgroundInput, setPlaygroundInput] = useState('');
  const [playgroundOutput, setPlaygroundOutput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [openInstallMenuId, setOpenInstallMenuId] = useState(null);

  const handleLogin = (provider) => {
    if (!isHumanVerified && authModalMode !== 'forgot') { showToast('请先完成人类验证 (Please verify you are human)', 'error'); return; }
    
    let mockName = 'Global_Dev_01'; let mockAvatar = 'G';
    if (provider === 'wechat') { mockName = '微信极客_01'; mockAvatar = 'W'; }
    else if (provider === 'whatsapp') { mockName = 'WA_User_88'; mockAvatar = 'WA'; }
    else if (provider === 'account') { mockName = loginForm.username || loginForm.email.split('@')[0] || 'User_01'; mockAvatar = mockName.charAt(0).toUpperCase(); }

    setCurrentUser({
      id: 'u_77x89', name: mockName, avatar: mockAvatar,
      vipLevel: 'Pro 开发者', vipColor: 'from-amber-400 to-orange-500',
      balance: 0.00, revenue: 1250.00, purchasedSkills: [], favorites: [104, 401]
    });
    
    setAuthModalMode(null); setIsHumanVerified(false); setLoginForm({ username: '', email: '', password: '', confirmPassword: '' });
    
    if (authModalMode === 'register' || currentUser === null) {
      setTimeout(() => setShowOnboarding(true), 500);
    } else {
      showToast('登录成功！', 'success');
    }
  };

  const handlePurchase = () => {
    if (currentUser.balance >= selectedSkillToBuy.price) {
      setCurrentUser(prev => ({ ...prev, balance: prev.balance - selectedSkillToBuy.price, purchasedSkills: [...prev.purchasedSkills, selectedSkillToBuy.id] }));
      setIsPurchaseModalOpen(false); setOpenInstallMenuId(selectedSkillToBuy.id);
      showToast('获取成功！资产已授权。', 'success');
    } else {
      setIsPurchaseModalOpen(false); setFinanceModal({ isOpen: true, type: 'deposit' });
      showToast('余额不足，请充值', 'error');
    }
  };

  const handleFinanceSubmit = (amount) => {
    if (financeModal.type === 'deposit') { setCurrentUser(prev => ({ ...prev, balance: prev.balance + amount })); showToast(`成功充值 ${formatMoney(amount, lang)}`, 'success'); } 
    else { 
      if (amount > currentUser.revenue) { showToast('收益余额不足', 'error'); return; }
      setCurrentUser(prev => ({ ...prev, revenue: prev.revenue - amount })); showToast(`提现 ${formatMoney(amount, lang)} 申请已提交`, 'success'); 
    }
    setFinanceModal({ isOpen: false });
  };

  const toggleFavorite = (e, skillId) => {
    e.stopPropagation();
    if (!currentUser) { setAuthModalMode('login'); return; }
    setCurrentUser(prev => {
      const isFav = prev.favorites.includes(skillId);
      if (isFav) showToast('已取消收藏', 'info');
      else showToast('已加入收藏库', 'success');
      return { ...prev, favorites: isFav ? prev.favorites.filter(id => id !== skillId) : [...prev.favorites, skillId] };
    });
  };

  const handleViewCreator = (e, authorName) => {
    e.stopPropagation();
    const authorSkills = mockSkills.filter(s => s.author === authorName);
    const totalLikes = authorSkills.reduce((sum, s) => sum + s.likes, 0);
    const totalDownloads = authorSkills.reduce((sum, s) => sum + parseDownloads(s.downloads), 0);
    setViewingCreator({
      name: authorName, skills: authorSkills, totalLikes,
      totalDownloads: totalDownloads > 1000000 ? (totalDownloads/1000000).toFixed(1)+'M' : (totalDownloads > 1000 ? (totalDownloads/1000).toFixed(1)+'K' : totalDownloads),
      avatar: authorName.charAt(0).toUpperCase(), joined: '2024',
      bio: `专注研发生产力相关的 AI 自动化组件。主要涉及大语言模型微调与数据结构化提取。`
    });
    setViewingSkill(null); setSearchQuery('');
  };

  const runPlaygroundTest = () => {
    if (!currentUser) { setAuthModalMode('login'); return; }
    if (!playgroundInput) return;
    setIsTesting(true); setPlaygroundOutput('');
    setTimeout(() => {
      setIsTesting(false);
      setPlaygroundOutput(`{\n  "status": "success",\n  "latency_ms": 1204,\n  "result": "Simulated sandbox output"\n}`);
      if (viewingSkill.cost > 0) { setCurrentUser(prev => ({ ...prev, balance: prev.balance - viewingSkill.cost })); }
    }, 1500);
  };

  const handlePublishSubmit = () => {
    setPublishStep('scanning');
    setTimeout(() => {
      setPublishStep('success'); showToast('安全扫描通过，资产已发布！', 'success');
      setTimeout(() => { setIsPublishModalOpen(false); setPublishStep('form'); }, 2000);
    }, 2500);
  };

  const filteredSkills = useMemo(() => {
    let result = mockSkills;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return result.filter(s => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || s.author.toLowerCase().includes(q)).sort((a,b)=>b.likes-a.likes);
    }
    if (activeTopCat) return result.filter(s => s.topCat === activeTopCat).sort((a,b)=>b.likes-a.likes);
    if (activeIndustry) {
      result = result.filter(s => s.industry === activeIndustry);
      if (activeSubCat !== 'All') result = result.filter(s => s.subCat === activeSubCat);
    }
    return result.sort((a,b)=>b.likes-a.likes);
  }, [activeIndustry, activeSubCat, activeTopCat, searchQuery]);

  const currentIndustryObj = industries.find(i => i.id === activeIndustry);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20 md:pb-0">
      {/* 1. 全局 Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* 2. 新手引导遮罩 (Onboarding) */}
      {showOnboarding && currentUser && (
        <div className="fixed inset-0 bg-indigo-900/90 backdrop-blur-md z-[300] flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-6"><ShieldCheck className="text-emerald-500" size={40} /></div>
          <h2 className="text-3xl font-black text-white mb-4">欢迎加入 TopAI 开发者生态！</h2>
          <p className="text-indigo-200 mb-8 max-w-md">为了让您无缝体验基于微隔离虚拟机的「沙盒试玩」，平台已为您免费注入 <strong>$5.00</strong> 的初始测试算力金。</p>
          <button onClick={() => { setCurrentUser(prev => ({...prev, balance: prev.balance + 5.0})); setShowOnboarding(false); showToast('$5.00 算力金已入账', 'success'); }} className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform hover:scale-105">
            领取 $5.00 并开始探索
          </button>
        </div>
      )}

      {/* 3. Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-[100] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setActiveTab('explore'); setViewingSkill(null); setViewingCreator(null); setActiveTopCat(null); setSearchQuery('');}}>
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-inner"><Code className="text-white" size={20} /></div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 hidden sm:block">TopAISkill</span>
          </div>

          <div className="flex-1 max-w-xl mx-4 sm:mx-8 relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input type="text" placeholder={t.search} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value) { setActiveTab('explore'); setViewingSkill(null); setViewingCreator(null); } }} className="w-full bg-slate-100 border border-transparent rounded-full py-2 pl-10 pr-10 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400"><X size={16} /></button>}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group hidden md:block">
              <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center gap-1 text-sm text-slate-600 hover:text-indigo-600"><Globe size={16} /> {languages.find(l => l.code === lang)?.name}</button>
                <div className={`absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-slate-100 z-50 ${isLangOpen ? "block" : "hidden"}`}>
                  {languages.map(l => (<button key={l.code} onClick={() => { setLang(l.code); setIsLangOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700">{l.name}</button>))}
              </div>
            </div>

            {currentUser && (
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="text-slate-500 hover:text-indigo-600 transition relative p-1">
                  <Bell size={20} />
                  {mockNotifications.some(n => !n.isRead) && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in-up">
                    <div className="p-3 border-b border-slate-100 bg-slate-50 font-bold text-sm text-slate-800 flex justify-between">通知中心 <span className="text-xs text-indigo-600 font-normal cursor-pointer">全部已读</span></div>
                    <div className="max-h-64 overflow-y-auto">
                      {mockNotifications.map(n => (
                        <div key={n.id} className={`p-3 border-b border-slate-100 text-sm hover:bg-slate-50 cursor-pointer ${n.isRead ? 'text-slate-500' : 'text-slate-800 font-medium'}`}>
                          <div className="flex justify-between items-start mb-1">{!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 mr-2 flex-shrink-0"></div>}<span className="flex-1">{n.text}</span></div>
                          <div className="text-[10px] text-slate-400 text-right">{n.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {currentUser ? (
              <div className="relative group">
                <div onClick={() => { setActiveTab('user'); setViewingSkill(null); setViewingCreator(null); }} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-md">{currentUser.avatar}</div>
                    <div className="absolute -top-1 -right-1 bg-amber-400 text-white rounded-full p-0.5 border-2 border-white"><Crown size={10} /></div>
                  </div>
                  <div className="hidden lg:block text-left leading-tight">
                    <div className="text-sm font-bold text-slate-800">{currentUser.name}</div>
                    <div className={`text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r ${currentUser.vipColor}`}>{currentUser.vipLevel}</div>
                  </div>
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 hidden group-hover:block z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 bg-slate-50"><div className="text-xs text-slate-500 mb-1">{t.balance}</div><div className="font-bold text-slate-800">{formatMoney(currentUser.balance, lang)}</div></div>
                  <button onClick={() => { setActiveTab('user'); setViewingSkill(null); setViewingCreator(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><User size={16} /> 控制台 / 个人中心</button>
                  <button onClick={() => {setCurrentUser(null); showToast('已退出', 'info');}} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut size={16} /> 退出登录</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAuthModalMode('login')} className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm">{t.login}</button>
            )}
          </div>
        </div>
        
        {/* 顶部快捷分类 */}
        <div className={`max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-3 overflow-x-auto no-scrollbar transition-opacity ${viewingSkill || viewingCreator || searchQuery ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
          {topCategories.map(cat => (
            <button key={cat.id} onClick={() => { setActiveTab('explore'); setActiveTopCat(cat.id); setActiveIndustry(null); setViewingSkill(null); setViewingCreator(null); }} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap border shadow-sm ${activeTopCat === cat.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <span className={activeTopCat === cat.id ? 'text-indigo-200' : 'text-indigo-500'}>{cat.icon}</span>{cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* 4. 主体内容 */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-8">
        
        {/* 左侧边栏 (PC) */}
        {!viewingSkill && !viewingCreator && !searchQuery && (
        <aside className="hidden md:block w-64 flex-shrink-0 animate-fade-in-up">
          <nav className="space-y-1 mb-8">
            <button onClick={() => setActiveTab('explore')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold transition ${activeTab === 'explore' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-100 border-l-4 border-transparent'}`}><Activity size={18} /> 探索大厅</button>
            <button onClick={() => setActiveTab('bounty')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold transition ${activeTab === 'bounty' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-100 border-l-4 border-transparent'}`}><Award size={18} /> 悬赏任务</button>
            <button onClick={() => { if(!currentUser){ setAuthModalMode('login'); return; } setActiveTab('user'); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold transition mt-4 ${activeTab === 'user' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-100 border-l-4 border-transparent'}`}><User size={18} /> 控制台 & 我的</button>
          </nav>
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">按行业检索</h3>
            <div className="space-y-1">
              {industries.map(ind => (
                <button key={ind.id} onClick={() => { setActiveTab('explore'); setActiveIndustry(ind.id); setActiveSubCat('All'); setActiveTopCat(null); }} className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition ${activeIndustry === ind.id && !activeTopCat ? 'bg-slate-800 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <div className="flex items-center gap-3"><span className={activeIndustry === ind.id && !activeTopCat ? 'text-indigo-400' : 'text-slate-400'}>{ind.icon}</span><span>{ind.name}</span></div>
                </button>
              ))}
            </div>
          </div>
        </aside>
        )}

        <section className={`flex-1 min-w-0 ${viewingSkill || viewingCreator || searchQuery ? 'w-full' : ''}`}>
          
          {/* ==================================================== */}
          {/* 视图 A: 创作者主页 */}
          {/* ==================================================== */}
          {viewingCreator && !viewingSkill && (
             <div className="animate-fade-in-up">
               <button onClick={() => setViewingCreator(null)} className="mb-4 text-slate-500 hover:text-indigo-600 flex items-center gap-1 text-sm font-bold"><ArrowLeft size={16} /> 返回大厅</button>
               <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-6">
                 <div className="h-32 bg-gradient-to-r from-indigo-900 via-slate-800 to-indigo-900 relative"></div>
                 <div className="px-8 pb-8 relative">
                   <div className="flex justify-between items-end -mt-12 mb-4">
                     <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg"><div className="w-full h-full bg-slate-800 rounded-xl text-white flex items-center justify-center font-black text-4xl">{viewingCreator.avatar}</div></div>
                     <div className="flex gap-3">
                       <button className="bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-slate-50"><Github size={16}/> Follow</button>
                       <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-indigo-700"><Heart size={16} className="fill-current text-pink-300"/> 赞助</button>
                     </div>
                   </div>
                   <h1 className="text-3xl font-black text-slate-900 mb-1">{viewingCreator.name}</h1>
                   <div className="text-sm text-slate-500 mb-4 flex items-center gap-4"><span className="flex items-center gap-1"><Award size={14} className="text-amber-500"/> Verified Developer</span><span className="flex items-center gap-1"><LinkIcon size={14}/> github.com/{viewingCreator.name.toLowerCase()}</span></div>
                   <p className="text-slate-600 max-w-2xl text-sm leading-relaxed mb-6">{viewingCreator.bio}</p>
                   <div className="flex gap-8 border-t border-slate-100 pt-6">
                     <div><div className="text-2xl font-black text-slate-800">{viewingCreator.skills.length}</div><div className="text-xs text-slate-400 font-bold uppercase">已发布组件</div></div>
                     <div><div className="text-2xl font-black text-slate-800">{viewingCreator.totalDownloads}</div><div className="text-xs text-slate-400 font-bold uppercase">累计被调用</div></div>
                     <div><div className="text-2xl font-black text-slate-800">{viewingCreator.totalLikes.toLocaleString()}</div><div className="text-xs text-slate-400 font-bold uppercase">社区点赞</div></div>
                   </div>
                 </div>
               </div>
               <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Code size={20} className="text-indigo-600"/> Assets by {viewingCreator.name}</h2>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {viewingCreator.skills.map(skill => (
                    <div key={'cr_'+skill.id} className="bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer relative" onClick={() => setViewingSkill(skill)}>
                      <button onClick={(e) => toggleFavorite(e, skill.id)} className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur shadow-sm hover:scale-110 transition-transform">
                        <Heart size={16} className={`${currentUser?.favorites.includes(skill.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                      </button>
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-slate-900 mb-2 pr-8">{skill.title}</h3>
                        <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">{skill.desc}</p>
                        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                           <div className="text-center"><div className="text-[10px] text-slate-400 uppercase font-bold">成功率</div><div className="text-sm font-black text-emerald-600">{skill.success}</div></div>
                           <div className="text-center border-l border-r border-slate-200"><div className="text-[10px] text-slate-400 uppercase font-bold">延迟</div><div className="text-sm font-black text-slate-700">{skill.latency}</div></div>
                           <div className="text-center"><div className="text-[10px] text-slate-400 uppercase font-bold">消耗/次</div><div className="text-sm font-black text-slate-700">{formatCost(skill.cost, lang)}</div></div>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
             </div>
          )}

          {/* ==================================================== */}
          {/* 视图 B: SKILL 详情页与沙盒 */}
          {/* ==================================================== */}
          {viewingSkill && !viewingCreator && (
            <div className="bg-white border-x border-t md:border border-slate-200 md:rounded-2xl shadow-sm overflow-hidden animate-fade-in-up">
              <div className="bg-slate-900 text-white p-6 relative">
                <button onClick={() => setViewingSkill(null)} className="absolute top-4 left-4 text-slate-400 hover:text-white flex items-center gap-1 text-sm font-medium"><ArrowLeft size={16} /> 返回</button>
                <div className="mt-8 flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                         {viewingSkill.industry ? industries.find(i=>i.id===viewingSkill.industry)?.name : topCategories.find(c=>c.id===viewingSkill.topCat)?.name}
                       </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3">
                      {viewingSkill.title}
                      {/* 详情页增加收藏按钮 */}
                      <button onClick={(e) => toggleFavorite(e, viewingSkill.id)} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition" title={currentUser?.favorites.includes(viewingSkill.id) ? "取消收藏" : "加入收藏"}>
                        <Heart size={20} className={`${currentUser?.favorites.includes(viewingSkill.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                      </button>
                      <select className="bg-slate-800 border border-slate-700 text-xs font-bold px-2 py-1 rounded outline-none text-slate-300">
                        {viewingSkill.versions.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </h1>
                    <p className="text-slate-400 text-sm max-w-xl">{viewingSkill.desc}</p>
                  </div>
                  <div className="w-full md:w-auto flex justify-between md:flex-col items-center md:items-end gap-3 mt-4 md:mt-0">
                    <div className="text-left md:text-right">
                      <div className="text-xs text-slate-400 uppercase font-bold">买断授权费</div>
                      <div className="text-2xl font-black text-emerald-400">{viewingSkill.price === 0 ? t.free : formatMoney(viewingSkill.price, lang)}</div>
                    </div>
                    <button onClick={() => { if (!currentUser) { setAuthModalMode('login'); return; } if (viewingSkill.price > 0 && !currentUser.purchasedSkills.includes(viewingSkill.id)) { setSelectedSkillToBuy(viewingSkill); setIsPurchaseModalOpen(true); return; } showToast("您已拥有最高授权", 'info'); }} className={`w-full md:w-auto px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg flex justify-center items-center gap-2 ${currentUser?.purchasedSkills.includes(viewingSkill.id) ? 'bg-emerald-500 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}>
                      <Download size={18} /> {currentUser?.purchasedSkills.includes(viewingSkill.id) ? '已授权 / 部署就绪' : t.install}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-200 flex bg-slate-50 overflow-x-auto no-scrollbar">
                <button onClick={()=>setActiveDetailTab('overview')} className={`px-6 py-4 font-bold flex items-center gap-2 whitespace-nowrap ${activeDetailTab==='overview'?'text-indigo-600 border-b-2 border-indigo-600':'text-slate-500'}`}><BookOpen size={16}/> 详细文档</button>
                <button onClick={()=>setActiveDetailTab('playground')} className={`px-6 py-4 font-bold flex items-center gap-2 whitespace-nowrap ${activeDetailTab==='playground'?'text-indigo-600 border-b-2 border-indigo-600':'text-slate-500'}`}><Terminal size={16}/> 安全沙盒试玩</button>
                <button onClick={()=>setActiveDetailTab('reviews')} className={`px-6 py-4 font-bold flex items-center gap-2 whitespace-nowrap ${activeDetailTab==='reviews'?'text-indigo-600 border-b-2 border-indigo-600':'text-slate-500'}`}><Star size={16}/> 用户评价 ({viewingSkill.reviews?.length || 0})</button>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  {activeDetailTab === 'overview' && (
                    <div className="prose prose-sm md:prose max-w-none prose-slate">
                       <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-sm font-bold mb-6">
                         <ShieldCheck size={18}/> 该版本代码已通过 AST 防投毒安全审查，且容器权限已被锁定。
                       </div>
                       <pre className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap font-sans border border-slate-200">{viewingSkill.readme}</pre>
                    </div>
                  )}
                  {activeDetailTab === 'playground' && (
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 md:p-6">
                       <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4"><Play className="text-emerald-500" size={20}/> 隔离云沙盒</h3>
                       <textarea value={playgroundInput} onChange={e=>setPlaygroundInput(e.target.value)} placeholder="输入测试数据 (JSON / Text)..." className="w-full h-32 bg-white border border-slate-300 rounded-lg p-3 text-sm mb-4 outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                       <div className="flex justify-between items-center mb-4">
                         <span className="text-xs text-slate-500">消耗预估: {formatCost(viewingSkill.cost, lang)}</span>
                         <button onClick={runPlaygroundTest} disabled={isTesting || !playgroundInput} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-600 transition disabled:opacity-50"><Terminal size={16}/> {isTesting ? '运行中...' : '运行测试'}</button>
                       </div>
                       <div className="bg-slate-900 rounded-lg p-4 h-40 relative overflow-hidden">
                         <div className="absolute top-2 right-3 text-xs text-slate-500 flex items-center gap-1"><FileJson size={14}/> Console</div>
                         <pre className="text-emerald-400 text-xs font-mono mt-4 whitespace-pre-wrap">{playgroundOutput || "> 等待输入..."}</pre>
                       </div>
                    </div>
                  )}
                  {activeDetailTab === 'reviews' && (
                    <div className="space-y-6">
                      <div className="flex justify-between border-b pb-4">
                        <div className="text-2xl font-black flex items-center gap-2">4.8 <Star className="text-amber-400 fill-current" size={24}/></div>
                        <button onClick={()=>showToast('只有购买该版本的用户才能评价', 'error')} className="border border-slate-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50">撰写评价</button>
                      </div>
                      {viewingSkill.reviews && viewingSkill.reviews.length > 0 ? viewingSkill.reviews.map((rev, i) => (
                        <div key={i} className="bg-white p-4 rounded-lg border border-slate-200">
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center gap-2"><span className="font-bold">{rev.user}</span>{rev.verified && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-bold"><Check size={10}/> Verified Buyer</span>}</div>
                            <span className="text-xs text-slate-400">{rev.date}</span>
                          </div>
                          <div className="flex gap-1 mb-2">{[...Array(5)].map((_, idx) => <Star key={idx} size={12} className={idx < rev.rating ? "text-amber-400 fill-current" : "text-slate-200"}/>)}</div>
                          <p className="text-sm text-slate-600">{rev.text}</p>
                        </div>
                      )) : <div className="text-center py-10 text-slate-500">暂无买家评价</div>}
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-4">性能基准</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-sm text-slate-500">历史成功率</span><span className="font-black text-emerald-600">{viewingSkill.success}</span></div>
                      <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-sm text-slate-500">平均延迟</span><span className="font-bold">{viewingSkill.latency}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-slate-500">消耗 (Token)</span><span className="font-bold">{formatCost(viewingSkill.cost, lang)}</span></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-4">开发者</h4>
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg" onClick={(e) => handleViewCreator(e, viewingSkill.author)}>
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex justify-center items-center font-bold text-lg">{viewingSkill.author.charAt(0)}</div>
                      <div>
                        <div className="font-bold text-sm text-indigo-600 hover:underline">@{viewingSkill.author}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1"><Award size={10}/> 核心贡献者</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 视图 C: 探索列表 */}
          {/* ==================================================== */}
          {!viewingSkill && !viewingCreator && activeTab === 'explore' && (
            <div className="animate-fade-in-up">
              {!searchQuery && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {activeTopCat ? (
                      <>{topCategories.find(c=>c.id===activeTopCat)?.icon} {topCategories.find(c=>c.id===activeTopCat)?.name}</>
                    ) : (
                      <>{currentIndustryObj?.icon} {currentIndustryObj?.name}</>
                    )}
                  </h2>
                  <button onClick={() => { 
                    if(!currentUser){setAuthModalMode('login'); return;} 
                    setPublishForm({...publishForm, category: activeTopCat ? topCategories.find(c=>c.id===activeTopCat)?.name : currentIndustryObj?.name});
                    setIsPublishModalOpen(true); 
                  }} className="flex items-center gap-1 bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-bold shadow-sm hover:bg-indigo-600 transition">
                    <PlusCircle size={16} /> 发布 SKILL
                  </button>
                </div>
              )}
              {/* 子行业 Tabs (仅在行业分类下显示) */}
              {!searchQuery && !activeTopCat && currentIndustryObj && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <button onClick={() => setActiveSubCat('All')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${activeSubCat === 'All' ? 'bg-slate-800 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{t.allSubCats}</button>
                  {currentIndustryObj.subCats.map(sub => (
                    <button key={sub} onClick={() => setActiveSubCat(sub)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${activeSubCat === sub ? 'bg-slate-800 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{sub}</button>
                  ))}
                </div>
              )}

              {filteredSkills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  {filteredSkills.map(skill => (
                    <div key={skill.id} className="bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer relative" onClick={() => setViewingSkill(skill)}>
                      <button onClick={(e) => toggleFavorite(e, skill.id)} className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur shadow-sm hover:scale-110 transition-transform" title={currentUser?.favorites.includes(skill.id) ? "取消收藏" : "加入收藏"}>
                        <Heart size={16} className={`${currentUser?.favorites.includes(skill.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                      </button>
                      <div className="p-4 md:p-5">
                        <h3 className="text-lg font-bold mb-2 line-clamp-1 pr-8">{skill.title}</h3>
                        <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">{skill.desc}</p>
                        <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div className="text-center"><div className="text-[10px] text-slate-400 uppercase font-bold">成功率</div><div className="text-sm font-black text-emerald-600">{skill.success}</div></div>
                          <div className="text-center border-l border-r border-slate-200"><div className="text-[10px] text-slate-400 uppercase font-bold">延迟</div><div className="text-sm font-black text-slate-700">{skill.latency}</div></div>
                          <div className="text-center"><div className="text-[10px] text-slate-400 uppercase font-bold">消耗/次</div><div className="text-sm font-black text-slate-700">{formatCost(skill.cost, lang)}</div></div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                           <div className="flex items-center gap-1 cursor-pointer hover:text-indigo-600 z-10 relative" onClick={(e) => handleViewCreator(e, skill.author)}>
                              <div className="w-5 h-5 rounded-full bg-slate-800 text-white flex justify-center items-center font-bold text-[10px]">{skill.author.charAt(0)}</div><span className="font-bold underline decoration-slate-300">@{skill.author}</span>
                           </div>
                           <div className="flex gap-3"><span className="flex items-center gap-1"><ThumbsUp size={12}/>{skill.likes.toLocaleString()}</span></div>
                        </div>
                      </div>
                      <div className="px-4 md:px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-between items-center">
                        <div className="flex flex-col"><span className="text-[10px] text-slate-400 font-bold uppercase">授权费</span><span className="text-lg font-black">{skill.price === 0 ? t.free : formatMoney(skill.price, lang)}</span></div>
                        <button className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-sm font-bold">查看详情</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed"><Search size={40} className="mx-auto text-slate-300 mb-2" /><p className="text-slate-500 font-bold">未找到匹配的 SKILL</p></div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* 视图 D: 悬赏大厅 */}
          {/* ==================================================== */}
          {!viewingSkill && !viewingCreator && activeTab === 'bounty' && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 animate-fade-in-up">
              <div className="flex justify-between mb-6"><h2 className="text-xl font-bold flex items-center gap-2"><Award className="text-indigo-600"/> 悬赏大厅</h2><button onClick={()=>{if(!currentUser){setAuthModalMode('login'); return;} showToast('该功能需要企业认证', 'info');}} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded text-sm font-bold hover:bg-indigo-100">+ 发布需求</button></div>
              <div className="space-y-4">
                {mockBounties.map(b => (
                  <div key={b.id} className="border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row justify-between md:items-center hover:border-indigo-300 transition">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center gap-2 mb-2"><h3 className="font-bold text-lg">{b.title}</h3>{b.status==='escrowed' && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase flex gap-1"><CheckCircle2 size={12}/> 已托管</span>}</div>
                      <p className="text-sm text-slate-500 mb-2">{b.req}</p>
                      <div className="flex gap-2">{b.tags.map(t=><span key={t} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{t}</span>)}</div>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="text-sm text-slate-400 font-bold uppercase">赏金</div>
                      <div className="text-2xl font-black text-indigo-600 mb-3">{formatMoney(b.amount, lang)}</div>
                      <button onClick={()=>{if(!currentUser){setAuthModalMode('login'); return;} setIsBiddingModalOpen(true); setBiddingBounty(b);}} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold shadow w-full md:w-auto hover:bg-indigo-600">竞标接单</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 视图 E: 控制台 (KMS、仲裁、收藏夹与资产管理) */}
          {/* ==================================================== */}
          {!viewingSkill && !viewingCreator && activeTab === 'user' && currentUser && (
             <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-white flex justify-center items-center font-bold text-3xl shadow-lg">{currentUser.avatar}</div>
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">{currentUser.name} <span className={`text-xs px-2 py-1 rounded bg-gradient-to-r ${currentUser.vipColor} text-white font-bold flex items-center gap-1`}><Crown size={12} /> {currentUser.vipLevel}</span></h2>
                  <p className="text-slate-500 text-sm mt-1">ID: {currentUser.id} | Auth Verified</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-6 border shadow-sm flex justify-between items-center relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 text-slate-50 opacity-50"><Wallet size={100}/></div>
                  <div className="relative z-10"><h3 className="text-sm font-bold text-slate-500 mb-1">可用资金 (购买/发布用)</h3><div className="text-3xl font-black text-slate-900">{formatMoney(currentUser.balance, lang)}</div></div>
                  <button onClick={() => setFinanceModal({isOpen: true, type: 'deposit'})} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold relative z-10 hover:bg-indigo-600 shadow">充值</button>
                </div>
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 border border-indigo-800 shadow-sm flex justify-between items-center text-white relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 text-indigo-800 opacity-50"><CreditCard size={100}/></div>
                  <div className="relative z-10"><h3 className="text-sm font-bold text-indigo-300 mb-1">累计收益 (接单/卖出用)</h3><div className="text-3xl font-black">{formatMoney(currentUser.revenue, lang)}</div></div>
                  <button onClick={() => setFinanceModal({isOpen: true, type: 'withdraw'})} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold relative z-10 shadow">提现</button>
                </div>
              </div>

              {/* === 我的收藏库 === */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Bookmark className="text-pink-500" size={20}/> 我的收藏 ({currentUser.favorites.length})</h3>
                {currentUser.favorites.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mockSkills.filter(s => currentUser.favorites.includes(s.id)).map(skill => (
                      <div key={'fav'+skill.id} className="border border-slate-100 bg-slate-50 rounded-lg p-4 flex justify-between items-center hover:border-pink-200 transition">
                        <div className="cursor-pointer flex-1 mr-4" onClick={() => setViewingSkill(skill)}>
                          <div className="font-bold text-slate-800 mb-1 line-clamp-1 hover:text-indigo-600">{skill.title}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">{skill.desc}</div>
                        </div>
                        <button onClick={(e) => toggleFavorite(e, skill.id)} className="text-slate-400 hover:text-red-500 p-2 shrink-0 bg-white rounded-full shadow-sm"><Heart size={16} className="fill-red-500 text-red-500"/></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm">暂无收藏的 SKILL。去探索大厅看看吧！</div>
                )}
              </div>

              {/* KMS 密钥 */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-1 flex items-center gap-2"><Key className="text-amber-500" size={20}/> 生产环境 API 密钥 (KMS)</h3>
                <p className="text-xs text-slate-500 mb-4">您的所有密钥在落盘时均采用 AES-256 GCM 加密，严禁在日志中明文打印。</p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex justify-between items-center mb-3">
                  <div><div className="text-sm font-bold font-mono">sk-topai-live-8f92...a1b2</div><div className="text-xs text-slate-400 mt-1">创建于: 2026-03-28 | 权限: 完整读写</div></div>
                  <div className="flex gap-2">
                    <button onClick={()=>showToast('密钥已复制至剪贴板', 'success')} className="bg-white border p-2 rounded text-slate-600 shadow-sm hover:text-indigo-600"><Copy size={16}/></button>
                    <button onClick={()=>showToast('吊销需进行二次短信验证', 'error')} className="bg-white border border-red-200 p-2 rounded text-red-500 shadow-sm hover:bg-red-50">吊销</button>
                  </div>
                </div>
              </div>

              {/* 工单仲裁 */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-1 flex items-center gap-2"><Scale className="text-indigo-600" size={20}/> 资金仲裁中心 (Resolution Center)</h3>
                <p className="text-xs text-slate-500 mb-4">保障交易双方资金安全，平台自动处理异常的 Token 消耗退款。</p>
                <div className="border border-slate-100 rounded-lg p-4 flex justify-between items-center hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex justify-center items-center"><AlertTriangle size={14}/></div>
                    <div>
                      <div className="text-sm font-bold">关于『穿透式财务审计』的退款争议</div>
                      <div className="text-xs text-slate-500 mt-1">工单号 #TK-8891 | 状态: 等待开发者举证</div>
                    </div>
                  </div>
                  <ChevronDown size={16} className="text-slate-400"/>
                </div>
              </div>

              {/* === 开发者资产与发布 === */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2"><UploadCloud className="text-indigo-600" size={20}/> 我的发布与资产库</h3>
                  <button onClick={() => setIsPublishModalOpen(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-600 transition flex items-center gap-2 shadow-sm">
                    <PlusCircle size={16}/> 发布新 SKILL
                  </button>
                </div>
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100 transition" onClick={() => setIsPublishModalOpen(true)}>
                  <Server className="mx-auto text-slate-300 mb-3" size={40}/>
                  <p className="text-slate-600 text-sm font-bold">您还未发布任何开源或商业 SKILL</p>
                  <p className="text-slate-400 text-xs mt-1">发布优质数字资产，赚取丰厚调用收益与全球社区声望</p>
                  <div className="mt-4 text-indigo-600 text-sm font-bold flex justify-center items-center gap-1">开始发布 <ArrowLeft size={14} className="rotate-180"/></div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ==================================================== */}
      {/* Mobile Bottom Nav */}
      {/* ==================================================== */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-[90] pb-safe flex justify-around shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <button onClick={()=>{setActiveTab('explore'); setViewingSkill(null); setViewingCreator(null);}} className={`p-3 flex flex-col items-center gap-1 ${activeTab==='explore'&&!viewingSkill&&!viewingCreator ? 'text-indigo-600' : 'text-slate-500'}`}><Activity size={20}/> <span className="text-[10px] font-bold">探索</span></button>
        <button onClick={()=>{if(!currentUser){setAuthModalMode('login'); return;} setIsPublishModalOpen(true);}} className="p-3 flex flex-col items-center gap-1 text-slate-500"><UploadCloud size={20}/> <span className="text-[10px] font-bold">发布</span></button>
        <button onClick={()=>{if(!currentUser){setAuthModalMode('login'); return;} setActiveTab('user'); setViewingSkill(null); setViewingCreator(null);}} className={`p-3 flex flex-col items-center gap-1 ${activeTab==='user'&&!viewingSkill&&!viewingCreator ? 'text-indigo-600' : 'text-slate-500'}`}><User size={20}/> <span className="text-[10px] font-bold">我的</span></button>
      </nav>

      {/* ==================================================== */}
      {/* 弹窗集 (Modals) */}
      {/* ==================================================== */}

      {/* 1. 高级专业发布弹窗 (含多模式选择与 AST 扫描) */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {publishStep === 'form' && (
              <>
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><UploadCloud className="text-indigo-600" size={20} /> 发布新 SKILL</h3>
                  <button onClick={() => setIsPublishModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-8 flex-1">
                  <section>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2 mb-4 flex items-center gap-2"><div className="w-5 h-5 rounded bg-slate-800 text-white flex items-center justify-center text-xs">1</div> 基础信息</h4>
                    <div className="space-y-4">
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">SKILL 名称</label><input type="text" placeholder="例如: GPT-4 数据清洗器" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">所属类目</label>
                        <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                          <option value="">-- 请选择 --</option>
                          <optgroup label="快捷分类">
                            {topCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </optgroup>
                          <optgroup label="行业垂直分类">
                            <option>基础工业制造 - 石油石化</option><option>基础工业制造 - 交通物流</option>
                            <option>制造业 - 面板制造</option><option>制造业 - 汽车及零部件</option>
                            <option>IT 与互联网 - 数据中心</option><option>IT 与互联网 - 安全加固</option>
                          </optgroup>
                        </select>
                      </div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">功能描述</label><textarea rows="2" placeholder="一句话描述它解决的核心痛点..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"></textarea></div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2 mb-4 flex items-center gap-2"><div className="w-5 h-5 rounded bg-slate-800 text-white flex items-center justify-center text-xs">2</div> 资产接入类型</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className={`border rounded-lg p-3 cursor-pointer transition ${publishForm.assetType==='config'?'border-indigo-500 bg-indigo-50':'border-slate-200 hover:border-slate-300'}`} onClick={()=>setPublishForm({...publishForm, assetType:'config'})}>
                        <FileText size={20} className={publishForm.assetType==='config'?'text-indigo-600 mb-2':'text-slate-400 mb-2'}/>
                        <div className="font-bold text-sm text-slate-800">本地配置文件</div>
                        <div className="text-xs text-slate-500">上传 .json 或 .yaml</div>
                      </div>
                      <div className={`border rounded-lg p-3 cursor-pointer transition ${publishForm.assetType==='api'?'border-indigo-500 bg-indigo-50':'border-slate-200 hover:border-slate-300'}`} onClick={()=>setPublishForm({...publishForm, assetType:'api'})}>
                        <Server size={20} className={publishForm.assetType==='api'?'text-indigo-600 mb-2':'text-slate-400 mb-2'}/>
                        <div className="font-bold text-sm text-slate-800">托管 API</div>
                        <div className="text-xs text-slate-500">填入 Endpoint URL</div>
                      </div>
                      <div className={`border rounded-lg p-3 cursor-pointer transition ${publishForm.assetType==='github'?'border-indigo-500 bg-indigo-50':'border-slate-200 hover:border-slate-300'}`} onClick={()=>setPublishForm({...publishForm, assetType:'github'})}>
                        <Github size={20} className={publishForm.assetType==='github'?'text-indigo-600 mb-2':'text-slate-400 mb-2'}/>
                        <div className="font-bold text-sm text-slate-800">GitHub 仓库</div>
                        <div className="text-xs text-slate-500">绑定公开/私有源</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      {publishForm.assetType === 'config' && <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center text-sm text-slate-500 hover:bg-slate-50 hover:border-indigo-300 transition cursor-pointer"><UploadCloud className="mx-auto mb-2 text-indigo-400"/>拖拽文件至此处，或点击上传<br/><span className="text-[10px]">系统将自动提取 AST 分析树</span></div>}
                      {publishForm.assetType === 'api' && <input type="text" placeholder="https://api.yourserver.com/v1/invoke" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>}
                      {publishForm.assetType === 'github' && <input type="text" placeholder="https://github.com/username/repo-name" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>}
                    </div>
                  </section>

                  <section>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2 mb-4 flex items-center gap-2"><div className="w-5 h-5 rounded bg-slate-800 text-white flex items-center justify-center text-xs">3</div> 商业模式</h4>
                    <div className="flex flex-wrap gap-4 mb-4">
                       <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="priceModel" checked={publishForm.priceModel==='free'} onChange={()=>setPublishForm({...publishForm, priceModel:'free'})} /> 完全免费开源</label>
                       <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="priceModel" checked={publishForm.priceModel==='license'} onChange={()=>setPublishForm({...publishForm, priceModel:'license'})}/> 一次性买断授权</label>
                       <label className="flex items-center gap-2 text-sm cursor-pointer text-slate-400" title="暂未开放"><input type="radio" disabled /> 按调用次数计费</label>
                    </div>
                    {publishForm.priceModel !== 'free' && (
                      <div className="flex items-center gap-2 mb-4">
                         <span className="text-sm font-bold text-slate-700">授权费 (USD):</span>
                         <input type="number" defaultValue="9.9" className="w-24 border border-slate-200 rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-right font-mono font-bold" />
                      </div>
                    )}
                  </section>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                  <button onClick={() => setIsPublishModalOpen(false)} className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-slate-800">取消</button>
                  <button onClick={handlePublishSubmit} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition shadow-md flex items-center gap-2">
                    提交部署并扫描漏洞 <ArrowLeft className="rotate-180" size={14}/>
                  </button>
                </div>
              </>
            )}
            
            {publishStep === 'scanning' && (
              <div className="p-10 text-center space-y-4">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                <h3 className="text-xl font-bold text-slate-800">AST 静态安全扫描中...</h3>
                <div className="bg-slate-900 text-emerald-400 text-xs font-mono p-3 rounded-lg text-left h-24 flex flex-col justify-end">
                  <div className="animate-pulse">[Scan] 分析依赖树结构... PASS</div>
                  <div className="animate-pulse">[Scan] 检查越权网络请求... PASS</div>
                  <div className="animate-pulse">[Scan] 扫描系统提权风险... PASS</div>
                </div>
              </div>
            )}
            
            {publishStep === 'success' && (
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="text-emerald-600" size={40}/></div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">资产发布就绪！</h3>
                <p className="text-sm text-slate-500">代码完全合规，已在分布式节点及隔离微虚拟机中挂载完成。</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. 满血版鉴权 Modal (Login/Register/Forgot) */}
      {authModalMode && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center relative">
              <button onClick={() => setAuthModalMode(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-800"><X size={20}/></button>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-6 mt-2">
                {authModalMode === 'login' ? '安全登录' : authModalMode === 'register' ? '创建开发者账号' : '重置密码'}
              </h2>
              
              <div className="space-y-3 mb-4 text-left">
                {(authModalMode === 'login' || authModalMode === 'forgot' || authModalMode === 'register') && (
                  <div><label className="text-xs font-bold block mb-1 text-slate-700">{authModalMode==='login'?'Email or Username / 邮箱或用户名':'Email Address / 邮箱'}</label><input type="email" value={loginForm.email} onChange={(e) => setLoginForm({...loginForm, email: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" /></div>
                )}
                {authModalMode === 'register' && (
                  <div><label className="text-xs font-bold block mb-1 text-slate-700">Username / 用户名</label><input type="text" value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" /></div>
                )}
                {(authModalMode === 'login' || authModalMode === 'register') && (
                  <div><label className="text-xs font-bold block mb-1 text-slate-700">Password / 密码</label><input type="password" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" /></div>
                )}
                {authModalMode === 'register' && (
                  <div><label className="text-xs font-bold block mb-1 text-slate-700">Confirm Password / 确认密码</label><input type="password" value={loginForm.confirmPassword} onChange={(e) => setLoginForm({...loginForm, confirmPassword: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50" /></div>
                )}
                {authModalMode === 'login' && <div className="text-right"><button onClick={()=>setAuthModalMode('forgot')} className="text-xs font-bold text-indigo-600 hover:underline">忘记密码?</button></div>}
              </div>

              {authModalMode !== 'forgot' && (
                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50 mb-6 cursor-pointer hover:bg-slate-100 transition" onClick={() => setIsHumanVerified(!isHumanVerified)}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${isHumanVerified ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}`}>
                    {isHumanVerified && <CheckCircle2 size={14} className="text-white" />}
                  </div><span className="text-sm font-medium text-slate-700 select-none">I am human / 防机器验证</span>
                </div>
              )}

              {authModalMode === 'forgot' ? (
                <button onClick={() => {showToast('重置邮件已发送至您的邮箱', 'success'); setAuthModalMode('login');}} className="w-full py-3 rounded-xl font-bold text-white shadow-md bg-slate-900 hover:bg-indigo-600 transition">发送重置邮件</button>
              ) : (
                <button onClick={()=>handleLogin('account')} className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition ${isHumanVerified ? 'bg-slate-900 hover:bg-indigo-600' : 'bg-slate-300 pointer-events-none'}`}>
                  {authModalMode === 'login' ? '验证并登录' : '同意协议并注册'}
                </button>
              )}

              {authModalMode !== 'forgot' && (
                <>
                  <div className="flex items-center gap-2 my-5"><div className="h-px bg-slate-200 flex-1"></div><span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">第三方快捷接入</span><div className="h-px bg-slate-200 flex-1"></div></div>
                  <div className="space-y-3">
                    <button onClick={()=>handleLogin('google')} className="w-full flex justify-center items-center gap-2 bg-white border border-slate-300 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition"><Chrome size={18} className="text-blue-500"/> Google</button>
                    <button onClick={()=>handleLogin('whatsapp')} className="w-full flex justify-center items-center gap-2 bg-[#25D366] text-white py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-[#1ebd5a] transition"><MessageSquare size={18}/> WhatsApp</button>
                    <button onClick={()=>handleLogin('wechat')} className="w-full flex justify-center items-center gap-2 bg-[#07C160] text-white py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-[#06ad56] transition"><MessageCircle size={18}/> WeChat</button>
                  </div>
                </>
              )}

              <div className="mt-6 pt-5 border-t border-slate-100 text-sm text-slate-600">
                {authModalMode === 'login' && <span>没有账号? <button onClick={() => setAuthModalMode('register')} className="font-bold text-indigo-600 hover:underline">去注册</button></span>}
                {authModalMode === 'register' && <span>已有账号? <button onClick={() => setAuthModalMode('login')} className="font-bold text-indigo-600 hover:underline">去登录</button></span>}
                {authModalMode === 'forgot' && <button onClick={() => setAuthModalMode('login')} className="font-bold text-indigo-600 flex justify-center items-center gap-1 mx-auto hover:underline"><ArrowLeft size={14}/> 返回登录</button>}
              </div>
           </div>
        </div>
      )}

      {/* 3. 购买确认与充值/提现 Modal */}
      {(isPurchaseModalOpen || financeModal.isOpen) && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <button onClick={() => {setIsPurchaseModalOpen(false); setFinanceModal({isOpen:false})}} className="absolute right-4 top-4 text-slate-400 hover:text-slate-800"><X size={20}/></button>
            
            {isPurchaseModalOpen ? (
              <>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ShieldCheck className="text-indigo-600"/> 获取最高授权</h3>
                <p className="text-sm text-slate-600 mb-4">购买 <strong>{selectedSkillToBuy?.title}</strong> 永久授权。</p>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg mb-6 flex justify-between items-center"><span className="text-sm font-bold text-slate-700">买断费用</span><span className="text-2xl font-black text-slate-900">{formatMoney(selectedSkillToBuy?.price, lang)}</span></div>
                <button onClick={handlePurchase} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-600 transition">确认支付</button>
              </>
            ) : (
              <>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${financeModal.type==='deposit'?'bg-indigo-600':'bg-emerald-600'}`}>
                  {financeModal.type==='deposit' ? <Wallet className="text-white"/> : <CreditCard className="text-white"/>}
                </div>
                <h3 className="text-xl font-bold mb-6 text-center text-slate-800">{financeModal.type==='deposit'?'充值测试算力金':'提取收益至银行卡'}</h3>
                <input type="number" id="f_amt" defaultValue="100" className="w-full text-center text-3xl font-black border border-slate-200 rounded-xl p-4 mb-6 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"/>
                <button onClick={() => handleFinanceSubmit(parseFloat(document.getElementById('f_amt').value||0))} className={`w-full py-3 text-white rounded-xl font-bold shadow-lg transition ${financeModal.type==='deposit'?'bg-indigo-600 hover:bg-indigo-700':'bg-emerald-600 hover:bg-emerald-700'}`}>确认执行</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 4. 悬赏竞标 Modal */}
      {isBiddingModalOpen && biddingBounty && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg relative shadow-2xl">
            <button onClick={() => setIsBiddingModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-800"><X size={20}/></button>
            <h3 className="text-lg font-bold mb-6 text-slate-800">提交开发竞标方案</h3>
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg mb-6">
              <div className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-1">悬赏目标</div>
              <div className="font-bold text-indigo-900 text-lg">{biddingBounty.title}</div>
            </div>
            <label className="text-sm font-bold block mb-2 text-slate-700">实现路径与排期</label>
            <textarea rows="4" placeholder="描述您的实现逻辑及预计交付周期..." className="w-full border border-slate-200 rounded-lg p-3 mb-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
            <label className="text-sm font-bold block mb-2 text-slate-700">我的报价 (USD)</label>
            <input type="number" defaultValue={biddingBounty.amount} className="w-full border border-slate-200 rounded-lg p-3 mb-6 font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"/>
            <button onClick={() => {showToast('竞标已加密发送给需求方！', 'success'); setIsBiddingModalOpen(false);}} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-indigo-600 transition shadow-lg">确认发出竞标</button>
          </div>
        </div>
      )}

    </div>
  );
}
