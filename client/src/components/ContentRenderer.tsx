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
          <div className={`prose dark:prose-invert max-w-none ${className}`}>
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                // 自定义代码块样式
                code: ({ node, inline, className: propClassName, children, ...props }: { node?: any; inline?: boolean; className?: string; children?: React.ReactNode }) => {
                  return inline ? (
                    <code className={`bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm ${propClassName || ''}`} {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className={`block bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto ${propClassName || ''}`} {...props}>
                      {children}
                    </code>
                  );
                },
                // 自定义表格样式
                table: ({ children }) => (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {children}
                  </td>
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