
import { TafsirVerse } from '../types';

class TafsirService {
  private baseUrl = 'https://quranenc.com/api/v1/translation/aya';

  async getTafsir(surahNumber: number, ayahNumber: number): Promise<string> {
    try {
      console.log(`Fetching Tafsir for Surah ${surahNumber}, Ayah ${ayahNumber}...`);
      
      // Using a fallback approach since the original API might not be accessible
      // This is a simplified tafsir service - in a real app you'd use the proper Ibn Katheer API
      const response = await fetch(`${this.baseUrl}/arabic_moyassar/${surahNumber}/${ayahNumber}`);
      const data = await response.json();
      
      if (data.result) {
        console.log(`Tafsir fetched successfully for ${surahNumber}:${ayahNumber}`);
        return data.result.translation || 'تفسير غير متوفر حاليا';
      } else {
        return 'تفسير غير متوفر حاليا';
      }
    } catch (error) {
      console.error(`Error fetching Tafsir for ${surahNumber}:${ayahNumber}:`, error);
      return 'تفسير غير متوفر حاليا';
    }
  }

  // Fallback method with basic tafsir explanations
  getBasicTafsir(surahNumber: number, ayahNumber: number): string {
    const basicTafsirs: { [key: string]: string } = {
      '1:1': 'بسم الله الرحمن الرحيم - ابتداء بذكر الله تعالى واستعانة به',
      '1:2': 'الحمد لله رب العالمين - الثناء على الله تعالى بصفاته الجميلة',
      '1:3': 'الرحمن الرحيم - صفتان من صفات الله تعالى تدلان على سعة رحمته',
      '1:4': 'مالك يوم الدين - الله تعالى هو المالك المتصرف في يوم القيامة',
      '1:5': 'إياك نعبد وإياك نستعين - إفراد الله بالعبادة والاستعانة',
      '1:6': 'اهدنا الصراط المستقيم - دعاء بطلب الهداية إلى الطريق القويم',
      '1:7': 'صراط الذين أنعمت عليهم - طريق الأنبياء والصالحين المنعم عليهم',
    };

    const key = `${surahNumber}:${ayahNumber}`;
    return basicTafsirs[key] || 'هذه آية كريمة من كتاب الله تحتاج إلى تدبر وتفكر في معانيها العظيمة';
  }
}

export const tafsirService = new TafsirService();
