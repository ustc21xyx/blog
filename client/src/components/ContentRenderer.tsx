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
        // 文本模式也支持LaTeX公式渲染
        let textContent = content;
        
        // 检查是否包含LaTeX公式
        const hasFormulas = /\$\$\$\$[\s\S]*?\$\$\$\$|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$/.test(textContent);
        
        if (hasFormulas) {
          // 处理 $$$$ 包裹的公式
          textContent = textContent.replace(/\$\$\$\$([\s\S]*?)\$\$\$\$/g, (match, latex) => {
            try {
              return katex.renderToString(latex.trim(), {
                throwOnError: false,
                displayMode: true,
                output: 'html'
              });
            } catch (error) {
              console.error('LaTeX render error:', error);
              return `<span class="text-red-600 dark:text-red-400">LaTeX错误: ${latex}</span>`;
            }
          });
          
          // 处理 $$ 包裹的公式
          textContent = textContent.replace(/\$\$([\s\S]*?)\$\$/g, (match, latex) => {
            try {
              return katex.renderToString(latex.trim(), {
                throwOnError: false,
                displayMode: true,
                output: 'html'
              });
            } catch (error) {
              console.error('LaTeX render error:', error);
              return `<span class="text-red-600 dark:text-red-400">LaTeX错误: ${latex}</span>`;
            }
          });
          
          // 处理 $ 包裹的公式
          textContent = textContent.replace(/\$([^$\n]+?)\$/g, (match, latex) => {
            try {
              return katex.renderToString(latex.trim(), {
                throwOnError: false,
                displayMode: false,
                output: 'html'
              });
            } catch (error) {
              console.error('LaTeX render error:', error);
              return `<span class="text-red-600 dark:text-red-400">LaTeX错误: ${latex}</span>`;
            }
          });
          
          // 转换换行符为HTML换行
          textContent = textContent.replace(/\n/g, '<br/>');
          
          return (
            <div 
              className={`${className}`}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(textContent) }}
            />
          );
        }
        
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
        let processedContent = content;
        
        // 首先处理 $$$$ 包裹的公式（四个美元符号）
        processedContent = processedContent.replace(/\$\$\$\$([\s\S]*?)\$\$\$\$/g, (match, latex) => {
          try {
            return katex.renderToString(latex.trim(), {
              throwOnError: false,
              displayMode: true,
              output: 'html'
            });
          } catch (error) {
            console.error('LaTeX render error:', error);
            return `<span class="text-red-600 dark:text-red-400">LaTeX错误: ${latex}</span>`;
          }
        });
        
        // 然后处理 $$ 包裹的公式（两个美元符号，显示模式）
        processedContent = processedContent.replace(/\$\$([\s\S]*?)\$\$/g, (match, latex) => {
          try {
            return katex.renderToString(latex.trim(), {
              throwOnError: false,
              displayMode: true,
              output: 'html'
            });
          } catch (error) {
            console.error('LaTeX render error:', error);
            return `<span class="text-red-600 dark:text-red-400">LaTeX错误: ${latex}</span>`;
          }
        });
        
        // 最后处理 $ 包裹的公式（单个美元符号，内联模式）
        processedContent = processedContent.replace(/\$([^$\n]+?)\$/g, (match, latex) => {
          try {
            return katex.renderToString(latex.trim(), {
              throwOnError: false,
              displayMode: false,
              output: 'html'
            });
          } catch (error) {
            console.error('LaTeX render error:', error);
            return `<span class="text-red-600 dark:text-red-400">LaTeX错误: ${latex}</span>`;
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