export function tidyUpHtml(html: string): string {
  let cleaned = html;

  // 1. Remove empty paragraphs or paragraphs with only whitespace/br
  cleaned = cleaned.replace(/<p>(\s*|<br\s*\/?>|&nbsp;)*<\/p>/gi, "");

  // 2. Ensure we only have one H1 at the top. If there are other H1s, downgrade them to H2.
  let h1Count = 0;
  cleaned = cleaned.replace(/<h1(.*?)>(.*?)<\/h1>/gi, (match, attrs, content) => {
    h1Count++;
    if (h1Count === 1) {
      return match; // Keep the first H1
    }
    // Downgrade subsequent H1s to H2
    return `<h2${attrs}>${content}</h2>`;
  });

  // 3. Remove consecutive spaces
  cleaned = cleaned.replace(/&nbsp;&nbsp;+/gi, "&nbsp;");

  // 4. Auto-convert common text patterns
  // "---" becomes <hr> if it's on its own line (usually handled by tiptap, but just in case)
  cleaned = cleaned.replace(/<p>---<\/p>/gi, '<hr>');

  // 5. Clean up weird nested spans that often come from copy-pasting
  // We won't strip all spans because some are used for formatting (like reminders), 
  // but we can strip empty spans.
  cleaned = cleaned.replace(/<span[^>]*>\s*<\/span>/gi, "");

  // Ensure there's at least one paragraph at the end so users can continue typing
  if (!cleaned.endsWith('</p>') && !cleaned.endsWith('</div>')) {
    cleaned += '<p></p>';
  }

  return cleaned;
}
