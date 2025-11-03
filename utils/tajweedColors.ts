
/**
 * Tajweed color mapping and utilities for Quran.com v4 API
 */

export interface TajweedRule {
  name: string;
  arabicName: string;
  color: string;
  classNames: string[];
  sampleLetter: string;
}

// Exact color mapping as per specification
export const TAJWEED_RULES: TajweedRule[] = [
  {
    name: 'Izhar Halqi',
    arabicName: 'إظهار حلقي',
    color: '#2E7D32',
    classNames: ['ham_wasl', 'slnt'],
    sampleLetter: 'ء',
  },
  {
    name: 'Idgham with Ghunnah',
    arabicName: 'إدغام بغنة',
    color: '#7E57C2',
    classNames: ['idgham_ghunnah', 'idgham-with-ghunnah', 'idgham'],
    sampleLetter: 'ن',
  },
  {
    name: 'Idgham without Ghunnah',
    arabicName: 'إدغام بغير غنة',
    color: '#5E35B1',
    classNames: ['idgham_wo_ghunnah', 'idgham-without-ghunnah'],
    sampleLetter: 'ل',
  },
  {
    name: 'Iqlab',
    arabicName: 'إقلاب',
    color: '#2196F3',
    classNames: ['iqlab'],
    sampleLetter: 'ب',
  },
  {
    name: 'Ikhfa',
    arabicName: 'إخفاء حقيقي',
    color: '#E53935',
    classNames: ['ikhfa_shafawi', 'ikhfa', 'ikhfaa'],
    sampleLetter: 'ص',
  },
  {
    name: 'Qalqalah',
    arabicName: 'قلقلة',
    color: '#43A047',
    classNames: ['qalaqah'],
    sampleLetter: 'ق',
  },
  {
    name: 'Madd',
    arabicName: 'مد',
    color: '#D81B60',
    classNames: ['madda_normal', 'madda_permissible', 'madda_necessary', 'madd'],
    sampleLetter: 'ا',
  },
  {
    name: 'Tafkheem',
    arabicName: 'تفخيم الراء',
    color: '#FF8F00',
    classNames: ['lam_shamsiyah', 'madda_obligatory'],
    sampleLetter: 'ر',
  },
  {
    name: 'Ghunnah',
    arabicName: 'سكون/شدة',
    color: '#6D4C41',
    classNames: ['ghunnah'],
    sampleLetter: 'م',
  },
];

/**
 * Get color for a Tajweed class name
 */
export function getTajweedColor(className: string): string | null {
  if (!className) return null;
  
  const lowerClass = className.toLowerCase();
  
  for (const rule of TAJWEED_RULES) {
    for (const ruleClass of rule.classNames) {
      if (lowerClass.includes(ruleClass.toLowerCase())) {
        return rule.color;
      }
    }
  }
  
  return null;
}

/**
 * Parse HTML with Tajweed classes and return styled segments
 */
export interface TajweedSegment {
  text: string;
  color?: string;
  className?: string;
}

export function parseTajweedHTML(html: string): TajweedSegment[] {
  if (!html) return [];

  const segments: TajweedSegment[] = [];
  
  // Clean up the HTML
  let cleanHtml = html.trim();
  
  // Remove wrapping paragraph tags if present
  cleanHtml = cleanHtml.replace(/^<p[^>]*>|<\/p>$/gi, '');
  
  // Regular expression to match span tags with classes
  const spanRegex = /<span\s+class="([^"]+)"[^>]*>([^<]*)<\/span>/gi;
  
  let lastIndex = 0;
  let match;
  
  // Create a temporary string to track position
  const tempHtml = cleanHtml;
  
  // Reset regex
  spanRegex.lastIndex = 0;
  
  while ((match = spanRegex.exec(tempHtml)) !== null) {
    // Add text before the span
    if (match.index > lastIndex) {
      const beforeText = tempHtml.substring(lastIndex, match.index);
      const cleanBefore = beforeText.replace(/<[^>]+>/g, '').trim();
      if (cleanBefore) {
        segments.push({ text: cleanBefore });
      }
    }
    
    const className = match[1];
    const text = match[2];
    const color = getTajweedColor(className);
    
    if (text && text.trim()) {
      segments.push({
        text: text.trim(),
        color: color || undefined,
        className: className,
      });
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after last span
  if (lastIndex < tempHtml.length) {
    const remainingText = tempHtml.substring(lastIndex).replace(/<[^>]+>/g, '').trim();
    if (remainingText) {
      segments.push({ text: remainingText });
    }
  }
  
  // If no segments were found with spans, try to extract plain text
  if (segments.length === 0) {
    const plainText = cleanHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (plainText) {
      segments.push({ text: plainText });
    }
  }
  
  return segments;
}

/**
 * Convert number to Arabic-Indic numerals (٠-٩)
 */
export function toArabicIndic(num: number): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(digit => {
    const d = parseInt(digit);
    return isNaN(d) ? digit : arabicNumerals[d];
  }).join('');
}

/**
 * Get Rub el Hizb label in Arabic
 */
export function getRubElHizbLabel(rubNumber: number): string {
  const labels: { [key: number]: string } = {
    1: 'ربع الحزب',
    2: 'نصف الحزب',
    3: 'ثلاثة أرباع الحزب',
    4: 'الحزب',
  };
  return labels[rubNumber] || 'ربع الحزب';
}

/**
 * Get Rub el Hizb symbol
 */
export function getRubElHizbSymbol(rubNumber: number): string {
  const symbols: { [key: number]: string } = {
    1: '¼',
    2: '½',
    3: '¾',
    4: '●',
  };
  return symbols[rubNumber] || '¼';
}
