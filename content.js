let isMarkdownRendered = false;
let originalContent = '';

// 配置marked选项
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  langPrefix: 'language-',
  smartLists: true,
  smartypants: true
});

// 创建目录容器
function createTocContainer() {
  const container = document.createElement('div');
  container.className = 'toc-container';
  
  const menu = document.createElement('div');
  menu.className = 'toc-menu';
  
  const content = document.createElement('div');
  content.className = 'toc-content';
  
  // 获取所有标题并生成目录项
  const headings = getHeadings();
  headings.forEach(heading => {
    const item = document.createElement('div');
    item.className = 'toc-item';
    item.textContent = heading.text;
    item.style.paddingLeft = `${(heading.level - 1) * 16 + 15}px`;
    item.setAttribute('data-id', heading.id);
    
    item.addEventListener('click', () => {
      const target = document.getElementById(heading.id);
      if (target) {
        const offset = target.offsetTop - 60;
        window.scrollTo({
          top: offset,
          behavior: 'smooth'
        });
        target.classList.add('highlight');
        setTimeout(() => {
          target.classList.remove('highlight');
        }, 2000);
      }
    });
    
    content.appendChild(item);
  });
  
  menu.appendChild(content);
  container.appendChild(menu);
  document.body.appendChild(container);
  
  return container;
}

// 创建控制按钮组
function createControlButtons() {
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'markdown-eye-controls';
  
  // 创建目录按钮
  const tocButton = document.createElement('button');
  tocButton.className = 'control-button';
  tocButton.innerHTML = '☰';
  tocButton.title = '显示目录';
  
  // 创建主题切换按钮
  const themeButton = document.createElement('button');
  themeButton.className = 'control-button';
  themeButton.innerHTML = '🌓';
  themeButton.title = '切换明暗主题';
  
  // 添加事件监听
  tocButton.addEventListener('click', () => {
    const container = document.querySelector('.toc-container');
    if (container) {
      container.classList.toggle('open');
    }
  });
  
  themeButton.addEventListener('click', toggleTheme);
  
  controlsContainer.appendChild(tocButton);
  controlsContainer.appendChild(themeButton);
  document.body.appendChild(controlsContainer);
}

// 获取页面中的所有标题
function getHeadings() {
  const content = document.querySelector('.markdown-eye-content');
  if (!content) return [];
  
  const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
  return Array.from(headings).map(heading => {
    // 确保每个标题都有唯一的 ID
    if (!heading.id) {
      heading.id = generateHeadingId(heading.textContent);
    }
    return {
      id: heading.id,
      text: heading.textContent,
      level: parseInt(heading.tagName.charAt(1))
    };
  });
}

// 生成标题ID
function generateHeadingId(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '') // 保留中文字符
    .replace(/^-+|-+$/g, '');
}

// 主题切换功能
function toggleTheme() {
  const body = document.body;
  const container = document.querySelector('.markdown-eye-content');
  const isDark = body.classList.toggle('dark-theme');
  container.classList.toggle('dark-theme');
  
  // 保存主题设置到 localStorage
  localStorage.setItem('markdown-eye-theme', isDark ? 'dark' : 'light');
}

// 初始化主题
function initTheme() {
  const savedTheme = localStorage.getItem('markdown-eye-theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    document.querySelector('.markdown-eye-content').classList.add('dark-theme');
  }
}

// 检查是否是Markdown文件
function isMarkdownFile() {
  return window.location.pathname.toLowerCase().endsWith('.md');
}

// 保存原始内容
function saveOriginalContent() {
  if (!originalContent) {
    originalContent = document.body.innerHTML;
  }
}

// 恢复原始内容
function restoreOriginal() {
  if (originalContent) {
    document.body.innerHTML = originalContent;
    
    // 清理添加的元素
    const controls = document.querySelector('.markdown-eye-controls');
    const tocContainer = document.querySelector('.toc-container');
    if (controls) controls.remove();
    if (tocContainer) tocContainer.remove();
    
    isMarkdownRendered = false;
  }
}

// 渲染Markdown内容
function renderMarkdown() {
  if (!isMarkdownFile()) return;
  
  saveOriginalContent();
  
  const content = document.body.textContent;
  const container = document.createElement('div');
  container.className = 'markdown-eye-content';
  container.innerHTML = marked.parse(content);
  document.body.innerHTML = '';
  document.body.appendChild(container);
  
  // 创建目录
  createTocContainer();
  
  // 创建控制按钮组
  createControlButtons();
  
  // 初始化主题
  initTheme();
  
  isMarkdownRendered = true;
}

// 切换Markdown渲染
function toggleMarkdown() {
  if (isMarkdownRendered) {
    restoreOriginal();
  } else {
    renderMarkdown();
  }
}

// 监听扩展消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleMarkdown") {
    toggleMarkdown();
  }
});

// 初始化
if (isMarkdownFile()) {
  toggleMarkdown();
}
