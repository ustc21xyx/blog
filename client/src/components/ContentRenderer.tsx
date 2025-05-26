import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import DOMPurify from 'dompurify';

interface ContentRendererProps {
  content: string;
  contentType: 'text' | 'latex' | 'html' | 'mixed';
  className?: string;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ content, contentType, className = '' }) => {
  const renderContent = () => {
    switch (contentType) {
      case 'text':
        return (
          <div className={`whitespace-pre-wrap ${className}`}>
            {content}
          </div>
        );

      case 'latex':
        try {
          const html = katex.renderToString(content, {
            throwOnError: false,
            displayMode: true,
            output: 'html'
          });
          return (
            <div 
              className={`katex-display ${className}`}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (error) {
          return (
            <div className={`text-red-600 dark:text-red-400 ${className}`}>
              LaTeX渲染错误: {content}
            </div>
          );
        }

      case 'html':
        const sanitizedHtml = DOMPurify.sanitize(content);
        return (
          <div 
            className={`prose dark:prose-invert max-w-none ${className}`}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        );

      case 'mixed':
        // 处理混合内容：支持内联LaTeX公式和HTML
        const processedContent = content
          .replace(/\$\$(.*?)\$\$/g, (match, latex) => {
            try {
              return katex.renderToString(latex, {
                throwOnError: false,
                displayMode: true
              });
            } catch {
              return match;
            }
          })
          .replace(/\$(.*?)\$/g, (match, latex) => {
            try {
              return katex.renderToString(latex, {
                throwOnError: false,
                displayMode: false
              });
            } catch {
              return match;
            }
          });
        
        const sanitizedContent = DOMPurify.sanitize(processedContent);
        return (
          <div 
            className={`prose dark:prose-invert max-w-none ${className}`}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        );

      default:
        return (
          <div className={`whitespace-pre-wrap ${className}`}>
            {content}
          </div>
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