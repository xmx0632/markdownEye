document.addEventListener('DOMContentLoaded', () => {
  const markdownInput = document.getElementById('markdown-input');
  const preview = document.getElementById('preview');

  // 确保marked已加载
  if (typeof marked === 'undefined') {
    console.error('Marked library not loaded!');
    preview.innerHTML = '<div class="error">Error: Markdown parser not loaded!</div>';
    return;
  }

  // 配置marked选项
  marked.setOptions({
    breaks: true,        // 支持GitHub风格的换行
    gfm: true,          // 启用GitHub风格的Markdown
    sanitize: false,    // 允许HTML标签
    pedantic: false,    // 不那么严格的解析
    headerIds: true,    // 为标题添加id
    mangle: false,      // 不转义标题中的字符
    smartLists: true,   // 使用更智能的列表行为
    smartypants: true   // 使用更智能的标点符号
  });

  // 实时渲染Markdown
  function renderMarkdown() {
    const markdown = markdownInput.value;
    if (!markdown.trim()) {
      preview.innerHTML = '<div class="placeholder">预览区域</div>';
      return;
    }

    try {
      console.log('Rendering markdown:', markdown.substring(0, 100) + '...');
      const html = marked.parse(markdown);
      preview.innerHTML = html;
      // 保存到本地存储
      localStorage.setItem('markdownEyeLastContent', markdown);
    } catch (error) {
      console.error('Markdown渲染错误:', error);
      preview.innerHTML = '<div class="error">渲染错误，请检查Markdown语法</div>';
    }
  }

  // 监听输入变化
  markdownInput.addEventListener('input', renderMarkdown);

  // 从本地存储恢复上次的内容
  const savedContent = localStorage.getItem('markdownEyeLastContent');
  if (savedContent) {
    markdownInput.value = savedContent;
    renderMarkdown();
  }

  // 尝试从剪贴板获取文本
  if (!savedContent) {
    navigator.clipboard.readText()
      .then(text => {
        if (text && text.trim()) {
          console.log('Got text from clipboard:', text.substring(0, 100) + '...');
          markdownInput.value = text;
          renderMarkdown();
        }
      })
      .catch(err => {
        console.log('无法访问剪贴板:', err);
      });
  }

  // 添加快捷键支持
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S: 复制HTML
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      const html = preview.innerHTML;
      navigator.clipboard.writeText(html)
        .then(() => {
          alert('HTML已复制到剪贴板！');
        })
        .catch(err => {
          console.error('复制失败:', err);
          alert('复制失败，请重试');
        });
    }
  });

  // 添加错误处理
  window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error:', msg, '\nURL:', url, '\nLine:', lineNo, '\nColumn:', columnNo, '\nError object:', error);
    return false;
  };

  // 初始渲染
  renderMarkdown();
});
