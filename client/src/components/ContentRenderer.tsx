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
  console.log('ContentRenderer - contentType:', contentType);
  console.log('ContentRenderer - content:', content);
  
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
        try {
          let processedContent = content;
          
          // 处理 $$ 包裹的块级公式
          processedContent = processedContent.replace(/\$\$([\s\S]*?)\$\$/g, (match, latex) => {
            try {
              console.log('Rendering block LaTeX:', latex);
              return katex.renderToString(latex.trim(), {
                throwOnError: false,
                displayMode: true,
                output: 'html'
              });
            } catch (error) {
              console.error('Block LaTeX error:', error);
              return `<div class="text-red-600 dark:text-red-400 p-2 border border-red-300 rounded">LaTeX错误: ${latex}</div>`;
            }
          });
          
          // 处理 $ 包裹的内联公式
          processedContent = processedContent.replace(/\$([^$\n]+?)\$/g, (match, latex) => {
            try {
              console.log('Rendering inline LaTeX:', latex);
              return katex.renderToString(latex.trim(), {
                throwOnError: false,
                displayMode: false,
                output: 'html'
              });
            } catch (error) {
              console.error('Inline LaTeX error:', error);
              return `<span class="text-red-600 dark:text-red-400">LaTeX错误: ${latex}</span>`;
            }
          });
          
          // 处理换行
          processedContent = processedContent.replace(/\n/g, '<br/>');
          
          console.log('Mixed mode final result:', processedContent);
          
          const sanitizedContent = DOMPurify.sanitize(processedContent);
          return (
            <div 
              className={`prose dark:prose-invert max-w-none ${className}`}
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          );
        } catch (error) {
          console.error('Mixed content error:', error);
          return (
            <div className={`text-red-600 dark:text-red-400 ${className}`}>
              内容渲染错误: {content}
            </div>
          );
        }

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