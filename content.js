// 全局变量
let isMarkdownRendered = false;
let originalContent = null;
let isDarkTheme = false;

// 配置marked选项
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  langPrefix: 'language-',
  smartLists: true,
  smartypants: true
});

// 检查是否是Markdown文件
function isMarkdownFile() {
  // 仅检查是否是.md后缀的文件
  return window.location.pathname.toLowerCase().endsWith('.md');
}

// 初始化插件
function initializeMarkdownEye() {
  // 如果不是markdown文件，直接返回
  if (!isMarkdownFile()) return;
  
  // 检查是否已经初始化
  if (document.querySelector('.markdown-eye-controls')) {
    return; // 如果已经存在控制按钮，则不重复创建
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

  isMarkdownRendered = true;
}

// 恢复原始内容
function restoreOriginal() {
  if (!isMarkdownFile()) return;
  
  if (originalContent) {
    // 移除所有添加的元素
    const controls = document.querySelector('.markdown-eye-controls');
    const toc = document.querySelector('.toc-container');
    if (controls) controls.remove();
    if (toc) toc.remove();

    // 恢复原始内容
    document.body.innerHTML = originalContent;
    isMarkdownRendered = false;
  }
}

// 切换Markdown渲染
function toggleMarkdown() {
  if (!isMarkdownFile()) return;
  
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

// 切换主题
function toggleTheme() {
  isDarkTheme = !isDarkTheme;
  
  // 切换 body 的主题
  document.body.classList.toggle('dark-theme');
  
  // 切换内容容器的主题
  const container = document.querySelector('.markdown-eye-content');
  if (container) {
    container.classList.toggle('dark-theme');
  }
  
  // 切换目录容器的主题
  const tocContainer = document.querySelector('.toc-container');
  if (tocContainer) {
    tocContainer.classList.toggle('dark-theme');
  }
}

// 监听扩展消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleMarkdown") {
    if (!isMarkdownFile()) {
      // 在非 md 文件中给出提示
      alert('MarkdownEye 只能在 Markdown 文件中使用。');
      return;
    }
    toggleMarkdown();
  }
});
