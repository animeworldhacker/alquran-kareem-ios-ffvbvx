
/**
 * Tajweed color mapping and utilities
 */

export interface TajweedRule {
  name: string;
  arabicName: string;
  color: string;
  className: string;
  sampleLetter: string;
}

export const TAJWEED_RULES: TajweedRule[] = [
  {
    name: 'Izhar Halqi',
    arabicName: 'إظهار حلقي',
    color: '#2E7D32',
    className: 'ham_wasl',
    sampleLetter: 'ء',
  },
  {
    name: 'Idgham with Ghunnah',
    arabicName: 'إدغام بغنة',
    color: '#7E57C2',
    className: 'idgham_ghunnah',
    sampleLetter: 'ن',
  },
  {
    name: 'Idgham without Ghunnah',
    arabicName: 'إدغام بغير غنة',
    color: '#5E35B1',
    className: 'idgham_wo_ghunnah',
    sampleLetter: 'ل',
  },
  {
    name: 'Iqlab',
    arabicName: 'إقلاب',
    color: '#2196F3',
    className: 'iqlab',
    sampleLetter: 'ب',
  },
  {
    name: 'Ikhfa',
    arabicName: 'إخفاء حقيقي',
    color: '#E53935',
    className: 'ikhfa',
    sampleLetter: 'ص',
  },
  {
    name: 'Qalqalah',
    arabicName: 'قلقلة',
    color: '#43A047',
    className: 'qalqalah',
    sampleLetter: 'ق',
  },
  {
    name: 'Tafkheem',
    arabicName: 'تفخيم الراء',
    color: '#FF8F00',
    className: 'madda_normal',
    sampleLetter: 'ر',
  },
  {
    name: 'Madd',
    arabicName: 'مد لازم/منفصل/متصل',
    color: '#D81B60',
    className: 'madda_permissible',
    sampleLetter: 'ا',
  },
  {
    name: 'Ghunnah',
    arabicName: 'السكون/النون/الميم المشددة',
    color: '#6D4C41',
    className: 'ghunnah',
    sampleLetter: 'م',
  },
];

/**
 * Get color for a Tajweed class
 */
export function getTajweedColor(className: string): string | null {
  const rule = TAJWEED_RULES.find(r => className.includes(r.className));
  return rule ? rule.color : null;
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
  
  // Remove any wrapping tags
  let cleanHtml = html.trim();
  
  // Regular expression to match HTML tags with classes
  const tagRegex = /<([^>]+)class="([^"]+)"[^>]*>([^<]*)<\/\1>/g;
  const simpleTagRegex = /<[^>]+>([^<]*)<\/[^>]+>/g;
  
  let lastIndex = 0;
  let match;
  
  // First, try to match tags with classes
  const tempHtml = cleanHtml;
  while ((match = tagRegex.exec(tempHtml)) !== null) {
    // Add text before the tag
    if (match.index > lastIndex) {
      const beforeText = tempHtml.substring(lastIndex, match.index);
      const cleanBefore = beforeText.replace(/<[^>]+>/g, '').trim();
      if (cleanBefore) {
        segments.push({ text: cleanBefore });
      }
    }
    
    const className = match[2];
    const text = match[3];
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
  
  // Add remaining text
  if (lastIndex < tempHtml.length) {
    const remainingText = tempHtml.substring(lastIndex).replace(/<[^>]+>/g, '').trim();
    if (remainingText) {
      segments.push({ text: remainingText });
    }
  }
  
  // If no segments were found with classes, try simple tag parsing
  if (segments.length === 0) {
    const plainText = cleanHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (plainText) {
      segments.push({ text: plainText });
    }
  }
  
  return segments;
}

/**
 * Convert number to Arabic-Indic numerals
 */
export function toArabicIndic(num: number): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
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
