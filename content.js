// 全局变量
let isMarkdownRendered = false;
let originalContent = null;

// 配置marked选项
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  langPrefix: 'language-',
  smartLists: true,
  smartypants: true
});

// 初始化插件
function initializeMarkdownEye() {
  // 检查是否已经初始化
  if (document.querySelector('.markdown-eye-controls')) {
    return; // 如果已经存在控制按钮，则不重复创建
  }

  // 检查是否是Markdown文件
  if (!isMarkdownFile()) {
    return;
  }

  // 保存原始内容
  if (!originalContent) {
    originalContent = document.body.innerHTML;
  }

  // 创建主容器
  const content = document.createElement('div');
  content.className = 'markdown-eye-content';
  
  // 获取原始内容并渲染
  const markdownContent = document.body.innerText;
  
  // 清空body
  document.body.innerHTML = '';
  
  // 渲染Markdown内容
  content.innerHTML = marked.parse(markdownContent);
  document.body.appendChild(content);
  
  // 创建目录容器
  createTocContainer();
  
  // 创建控制按钮
  createControlButtons();
  
  // 初始化主题
  initTheme();

  isMarkdownRendered = true;
}

// 恢复原始内容
function restoreOriginal() {
  if (originalContent) {
    // 移除所有添加的元素
    const controls = document.querySelector('.markdown-eye-controls');
    const toc = document.querySelector('.toc-container');
    if (controls) controls.remove();
    if (toc) toc.remove();

    // 恢复原始内容
    document.body.innerHTML = originalContent;
    
    isMarkdownRendered = false;
    
    // 移除主题相关的类
    document.body.classList.remove('dark-theme');
  }
}

// 切换Markdown渲染
function toggleMarkdown() {
  if (isMarkdownRendered) {
    restoreOriginal();
  } else {
    initializeMarkdownEye();
  }
}

// 创建控制按钮组
function createControlButtons() {
  // 检查是否已存在控制按钮
  if (document.querySelector('.markdown-eye-controls')) {
    return;
  }

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

// 创建目录容器
function createTocContainer() {
  // 检查是否已存在目录容器
  if (document.querySelector('.toc-container')) {
    return;
  }

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
  
  // 使用 chrome.storage.local 保存主题设置
  chrome.storage.local.set({ 'markdown-eye-theme': isDark ? 'dark' : 'light' });
}

// 初始化主题
function initTheme() {
  // 使用 chrome.storage.local 获取主题设置
  chrome.storage.local.get(['markdown-eye-theme'], function(result) {
    if (result['markdown-eye-theme'] === 'dark') {
      document.body.classList.add('dark-theme');
      const container = document.querySelector('.markdown-eye-content');
      if (container) {
        container.classList.add('dark-theme');
      }
    }
  });
}

// 检查是否是Markdown文件
function isMarkdownFile() {
  return window.location.pathname.toLowerCase().endsWith('.md');
}

// 监听扩展消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleMarkdown") {
    toggleMarkdown();
  }
});

// 初始化
if (isMarkdownFile()) {
  initializeMarkdownEye();
}
