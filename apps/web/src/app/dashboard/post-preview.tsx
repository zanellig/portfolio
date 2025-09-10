"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PostPreviewProps {
  content: string;
  format: "markdown" | "html";
  title: string;
  coverImageUrl?: string; // Added coverImageUrl prop
}

export function PostPreview({
  content,
  format,
  title,
  coverImageUrl,
}: PostPreviewProps) {
  const processedContent = useMemo(() => {
    if (format === "html") {
      return content;
    }

    // Simple markdown to HTML conversion
    const html = content
      // Headers
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      // Bold
      .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*)\*/gim, "<em>$1</em>")
      // Code
      .replace(/`(.*?)`/gim, "<code>$1</code>")
      // Links
      .replace(
        /\[([^\]]*)\]$$([^$$]*)\)/gim,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      // Images
      .replace(/!\[([^\]]*)\]$$([^$$]*)\)/gim, '<img src="$2" alt="$1" />')
      // Unordered lists
      .replace(/^- (.*$)/gim, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/gims, "<ul>$1</ul>")
      // Ordered lists
      .replace(/^\d+\. (.*$)/gim, "<li>$1</li>")
      // Blockquotes
      .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")
      // Line breaks
      .replace(/\n/gim, "<br>");

    return html;
  }, [content, format]);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-slate max-w-none">
          {title && (
            <h1 className="text-2xl font-bold mb-4 text-balance">{title}</h1>
          )}
          {coverImageUrl && (
            <div className="mb-6">
              <img
                src={coverImageUrl || "/placeholder.svg"}
                alt="Cover image"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}
          <div
            className="preview-content"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </div>
        <style jsx>{`
          .preview-content h1 {
            font-size: 1.875rem;
            font-weight: 700;
            margin: 1.5rem 0 1rem 0;
            line-height: 1.2;
          }
          .preview-content h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 1.25rem 0 0.75rem 0;
            line-height: 1.3;
          }
          .preview-content h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 1rem 0 0.5rem 0;
            line-height: 1.4;
          }
          .preview-content p {
            margin: 0.75rem 0;
            line-height: 1.6;
          }
          .preview-content strong {
            font-weight: 600;
          }
          .preview-content em {
            font-style: italic;
          }
          .preview-content code {
            background: #f1f5f9;
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-family: ui-monospace, monospace;
            font-size: 0.875rem;
          }
          .preview-content ul,
          .preview-content ol {
            margin: 0.75rem 0;
            padding-left: 1.5rem;
          }
          .preview-content li {
            margin: 0.25rem 0;
            line-height: 1.5;
          }
          .preview-content blockquote {
            border-left: 4px solid #10b981;
            padding-left: 1rem;
            margin: 1rem 0;
            font-style: italic;
            color: #64748b;
          }
          .preview-content a {
            color: #10b981;
            text-decoration: underline;
          }
          .preview-content img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
            margin: 1rem 0;
          }
        `}</style>
      </CardContent>
    </Card>
  );
}
