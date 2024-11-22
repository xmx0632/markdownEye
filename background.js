// 监听扩展图标点击事件
chrome.action.onClicked.addListener((tab) => {
  // 检查是否是 Markdown 文件
  if (!tab.url.toLowerCase().match(/\.md($|\?)/)) {
    // 如果不是 Markdown 文件，显示提示
    chrome.action.setTitle({
      tabId: tab.id,
      title: "MarkdownEye 只能在 Markdown 文件中使用"
    });
    return;
  }
  
  // 向当前标签页发送消息
  chrome.tabs.sendMessage(tab.id, { action: "toggleMarkdown" });
});
