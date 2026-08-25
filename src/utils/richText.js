const allowedTags = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'a', 'h2', 'h3', 'h4', 'blockquote', 'pre', 'code', 'span', 'div', 'hr', 'font',
])

const blockTags = new Set(['p', 'div', 'h2', 'h3', 'h4', 'blockquote', 'li', 'pre'])
const colorPattern = /^(#[0-9a-f]{3,8}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)|rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)|[a-z]+)$/i
const sizeMap = { 1: '12px', 2: '13px', 3: '14px', 4: '16px', 5: '18px', 6: '24px', 7: '32px' }

const isSafeHref = (href) => {
  const value = String(href || '').trim().toLowerCase()
  return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('mailto:') || value.startsWith('tel:') || value.startsWith('/') || value.startsWith('#')
}

const cleanStyle = (tag, styleText = '') => {
  const styles = []
  const source = String(styleText || '').split(';')

  for (const item of source) {
    const [rawName, ...rawValue] = item.split(':')
    const name = String(rawName || '').trim().toLowerCase()
    const value = rawValue.join(':').trim()
    if (!name || !value) continue

    if (name === 'text-align' && blockTags.has(tag) && ['left', 'center', 'right', 'justify'].includes(value.toLowerCase())) {
      styles.push(`text-align: ${value.toLowerCase()}`)
    }
    if (name === 'margin-left' && /^\d{1,3}px$/.test(value)) styles.push(`margin-left: ${value}`)
    if (name === 'color' && colorPattern.test(value)) styles.push(`color: ${value}`)
    if ((name === 'background-color' || name === 'background') && colorPattern.test(value)) styles.push(`background-color: ${value}`)
    if (name === 'font-size' && /^(12|13|14|16|18|20|24|28|32)px$/.test(value)) styles.push(`font-size: ${value}`)
  }

  return styles.join('; ')
}

export const sanitizeRichText = (html = '') => {
  const raw = String(html || '')
  if (!raw.trim()) return ''
  if (typeof window === 'undefined' || typeof window.DOMParser === 'undefined') {
    return raw.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').replace(/\son\w+="[^"]*"/gi, '')
  }

  const parser = new window.DOMParser()
  const doc = parser.parseFromString(`<div>${raw}</div>`, 'text/html')

  const cleanElement = (element) => {
    Array.from(element.children).forEach((child) => {
      let tag = child.tagName.toLowerCase()
      if (!allowedTags.has(tag)) {
        child.replaceWith(...Array.from(child.childNodes))
        return
      }

      if (tag === 'font') {
        const span = doc.createElement('span')
        const color = child.getAttribute('color')
        const size = child.getAttribute('size')
        const style = [color && colorPattern.test(color) ? `color: ${color}` : '', sizeMap[size] ? `font-size: ${sizeMap[size]}` : ''].filter(Boolean).join('; ')
        if (style) span.setAttribute('style', style)
        span.append(...Array.from(child.childNodes))
        child.replaceWith(span)
        child = span
        tag = 'span'
      }

      const style = cleanStyle(tag, child.getAttribute('style') || '')
      Array.from(child.attributes).forEach((attribute) => {
        const name = attribute.name.toLowerCase()
        if (tag === 'a' && name === 'href') {
          if (!isSafeHref(attribute.value)) child.removeAttribute(attribute.name)
          return
        }
        child.removeAttribute(attribute.name)
      })
      if (style) child.setAttribute('style', style)

      if (tag === 'a') {
        child.setAttribute('target', '_blank')
        child.setAttribute('rel', 'noreferrer')
      }

      cleanElement(child)
    })
  }

  cleanElement(doc.body)
  return doc.body.innerHTML
}

export const stripRichText = (html = '') => {
  const raw = String(html || '')
  if (!raw.trim()) return ''
  if (typeof window === 'undefined' || typeof window.DOMParser === 'undefined') {
    return raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  const parser = new window.DOMParser()
  const doc = parser.parseFromString(raw, 'text/html')
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim()
}

export const isRichTextEmpty = (html = '') => stripRichText(html).length === 0