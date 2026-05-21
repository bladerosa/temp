/**
 * Robust copy-to-clipboard with execCommand fallback.
 *
 * navigator.clipboard.writeText silently rejects in non-secure contexts and
 * inside some iframes; the deprecated execCommand path still works there.
 * Returns true on success.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through */
    }
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '-9999px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    const selected =
      document.getSelection()?.rangeCount && document.getSelection()?.getRangeAt(0);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if (selected) {
      document.getSelection()?.removeAllRanges();
      document.getSelection()?.addRange(selected);
    }
    return ok;
  } catch {
    return false;
  }
}
