import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import DOMPurify from 'dompurify';

interface ContentRendererProps {
  content: string;
  contentType: 'markdown' | 'html' | 'text' | 'latex' | 'mixed';
  className?: string;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ content, contentType, className = '' }) => {
  console.log('ContentRenderer - contentType:', contentType);
  console.log('ContentRenderer - content:', content);
  
  const renderContent = () => {
    switch (contentType) {
      case 'markdown':
      case 'text':     // 兼容旧数据
      case 'latex':    // 兼容旧数据
      case 'mixed':    // 兼容旧数据
      default:         // 默认将未知或兼容类型作为 markdown 处理
        // Markdown模式：支持完整Markdown语法和LaTeX数学公式
        // 如果 contentType 是 'html'，它将被下面的 'case: html' 捕获。
        // 所有其他类型 (markdown, text, latex, mixed, 或任何未明确列出的) 将在此处作为 markdown 处理。
        return (
          <div className={`blog-content ${className}`}>
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                // 自定义标题样式 - 添加kawaii元素
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold mb-6 anime-gradient-text relative">
                    <span className="mr-2">🌟</span>
                    {children}
                    <span className="ml-2">🌟</span>
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200 relative flex items-center">
                    <span className="mr-2 text-anime-pink-500">✨</span>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-medium mb-3 text-gray-700 dark:text-gray-300 flex items-center">
                    <span className="mr-2 text-anime-purple-500">💫</span>
                    {children}
                  </h3>
                ),
                
                // 自定义段落样式
                p: ({ children }) => (
                  <p className="mb-4 leading-relaxed text-gray-600 dark:text-gray-300">
                    {children}
                  </p>
                ),
                
                // 自定义引用样式 - kawaii风格
                blockquote: ({ children }) => (
                  <blockquote className="kawaii-card border-l-4 border-anime-pink-500 pl-6 pr-4 py-4 mb-4 relative">
                    <div className="absolute top-2 left-2 text-anime-pink-500 text-lg">💕</div>
                    <div className="ml-4">{children}</div>
                  </blockquote>
                ),
                
                // 自定义链接样式
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-anime-purple-600 hover:text-anime-pink-600 transition-colors duration-200 font-medium border-b border-dotted border-anime-purple-300 hover:border-anime-pink-300"
                  >
                    {children}
                  </a>
                ),
                
                // 自定义代码块样式 - kawaii风格
                code: ({ node, inline, className: propClassName, children, ...props }: { node?: any; inline?: boolean; className?: string; children?: React.ReactNode }) => {
                  return inline ? (
                    <code className="bg-anime-purple-100 dark:bg-anime-purple-900/30 text-anime-purple-700 dark:text-anime-purple-300 px-2 py-1 rounded-md text-sm font-mono border border-anime-purple-200 dark:border-anime-purple-700" {...props}>
                      {children}
                    </code>
                  ) : (
                    <div className="relative mb-4">
                      <div className="absolute top-2 left-3 text-anime-pink-400 text-sm">🌸 代码</div>
                      <pre className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 p-4 pt-8 rounded-xl overflow-x-auto border-2 border-anime-purple-200 dark:border-anime-purple-700">
                        <code className="text-gray-100 font-mono text-sm" {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  );
                },
                
                // 自定义列表样式
                ul: ({ children }) => (
                  <ul className="mb-4 space-y-2">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-4 space-y-2">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="flex items-start">
                    <span className="mr-2 text-anime-pink-500 mt-1">🌺</span>
                    <span className="text-gray-600 dark:text-gray-300">{children}</span>
                  </li>
                ),
                
                // 自定义表格样式 - kawaii风格
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-6">
                    <div className="kawaii-card p-4">
                      <div className="flex items-center mb-3">
                        <span className="text-anime-pink-500 mr-2">📊</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">数据表格</span>
                      </div>
                      <table className="min-w-full">
                        {children}
                      </table>
                    </div>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-3 bg-gradient-to-r from-anime-purple-100 to-anime-pink-100 dark:from-anime-purple-900/30 dark:to-anime-pink-900/30 text-left text-sm font-medium text-anime-purple-800 dark:text-anime-purple-200 rounded-t-lg border-b-2 border-anime-purple-200 dark:border-anime-purple-700">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    {children}
                  </td>
                ),
                
                // 自定义强调样式
                strong: ({ children }) => (
                  <strong className="font-bold text-anime-purple-700 dark:text-anime-purple-300">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-anime-pink-600 dark:text-anime-pink-400">
                    {children}
                  </em>
                ),
                
                // 自定义分割线
                hr: () => (
                  <div className="my-8 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-anime-pink-400">🌸</span>
                      <div className="w-20 h-px bg-gradient-to-r from-transparent via-anime-purple-300 to-transparent"></div>
                      <span className="text-anime-purple-400">✨</span>
                      <div className="w-20 h-px bg-gradient-to-r from-transparent via-anime-pink-300 to-transparent"></div>
                      <span className="text-anime-pink-400">🌸</span>
                    </div>
                  </div>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        );

      case 'html':
        // HTML模式
        const sanitizedHtml = DOMPurify.sanitize(content);
        return (
          <div 
            className={`prose dark:prose-invert max-w-none ${className}`}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        );
    }
  };

  return (
    <div className="content-renderer">
      {renderContent()}
    </div>
  );
};

export default ContentRenderer;