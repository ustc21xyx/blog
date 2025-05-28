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
          <div className={`prose prose-lg dark:prose-invert max-w-none ${className}`}>
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                // 标题使用您已有的blog-content样式
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold mb-6 anime-gradient-text font-heading">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200 font-heading">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-medium mb-3 text-gray-700 dark:text-gray-300 font-heading">
                    {children}
                  </h3>
                ),
                
                // 段落保持自然流畅
                p: ({ children }) => (
                  <p className="mb-4 leading-relaxed text-gray-600 dark:text-gray-300 font-anime">
                    {children}
                  </p>
                ),
                
                // 引用框融入主题但不过度装饰
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-anime-purple-500 pl-6 py-2 my-6 bg-gray-50/50 dark:bg-dark-card/50 rounded-r-lg italic text-gray-600 dark:text-gray-400">
                    {children}
                  </blockquote>
                ),
                
                // 链接使用主题色但保持简洁
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-anime-purple-600 hover:text-anime-pink-600 dark:text-anime-purple-400 dark:hover:text-anime-pink-400 transition-colors duration-200 underline decoration-dotted underline-offset-2 hover:decoration-solid"
                  >
                    {children}
                  </a>
                ),
                
                // 代码样式融入主题
                code: ({ node, inline, className: propClassName, children, ...props }: { node?: any; inline?: boolean; className?: string; children?: React.ReactNode }) => {
                  return inline ? (
                    <code className="bg-anime-purple-100 dark:bg-anime-purple-900/20 text-anime-purple-700 dark:text-anime-purple-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-gray-900 dark:bg-black p-4 rounded-lg overflow-x-auto my-4 border border-gray-200 dark:border-dark-border">
                      <code className="text-gray-100 font-mono text-sm" {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                },
                
                // 列表保持标准但使用主题色
                ul: ({ children }) => (
                  <ul className="mb-4 space-y-1 list-disc list-inside marker:text-anime-purple-400">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-4 space-y-1 list-decimal list-inside marker:text-anime-purple-400">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-600 dark:text-gray-300 pl-2">
                    {children}
                  </li>
                ),
                
                // 表格使用现有的anime-card样式
                table: ({ children }) => (
                  <div className="overflow-x-auto my-6">
                    <div className="anime-card p-0 overflow-hidden">
                      <table className="min-w-full">
                        {children}
                      </table>
                    </div>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-3 bg-gray-50 dark:bg-dark-bg text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-dark-border">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-dark-border/50">
                    {children}
                  </td>
                ),
                
                // 强调保持简洁
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900 dark:text-white">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-gray-700 dark:text-gray-300">
                    {children}
                  </em>
                ),
                
                // 分割线简洁优雅
                hr: () => (
                  <div className="my-8">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
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