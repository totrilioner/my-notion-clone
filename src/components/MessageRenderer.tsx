import Link from "next/link";
import React from "react";

export default function MessageRenderer({ content }: { content: string }) {
  if (!content) return null;

  // Regex to match [@SOP: Judul SOP#Bagian](/dashboard/sops/id#bagian-id)
  const tagRegex = /\[@SOP:\s*(.+?)\]\((.+?)\)/g;
  
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = tagRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }
    
    const label = match[1];
    const url = match[2];
    
    parts.push(
      <Link key={match.index} href={url} style={{
        color: 'var(--brand-primary, #0070f3)',
        fontWeight: 500,
        textDecoration: 'none',
        background: 'rgba(0, 112, 243, 0.1)',
        padding: '2px 6px',
        borderRadius: '4px',
        display: 'inline-block',
        margin: '0 2px'
      }}>
        @{label}
      </Link>
    );
    
    lastIndex = tagRegex.lastIndex;
  }
  
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return <span>{parts.length > 0 ? parts : content}</span>;
}
