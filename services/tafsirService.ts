
import { TafsirVerse } from '../types';

class TafsirService {
  private baseUrl = 'https://quranenc.com/api/v1/translation/aya';

  async getTafsir(surahNumber: number, ayahNumber: number): Promise<string> {
    try {
      console.log(`Fetching Tafsir for Surah ${surahNumber}, Ayah ${ayahNumber}...`);
      
      if (!surahNumber || !ayahNumber || surahNumber < 1 || surahNumber > 114 || ayahNumber < 1) {
        throw new Error(`Invalid parameters: surah ${surahNumber}, ayah ${ayahNumber}`);
      }
      
      // Using a fallback approach since the original API might not be accessible
      const response = await fetch(`${this.baseUrl}/arabic_moyassar/${surahNumber}/${ayahNumber}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.log(`Tafsir API returned ${response.status}, using fallback`);
        return this.getBasicTafsir(surahNumber, ayahNumber);
      }
      
      const data = await response.json();
      
      if (data && data.result && data.result.translation) {
        console.log(`Tafsir fetched successfully for ${surahNumber}:${ayahNumber}`);
        return data.result.translation;
      } else {
        console.log(`No tafsir data found, using fallback for ${surahNumber}:${ayahNumber}`);
        return this.getBasicTafsir(surahNumber, ayahNumber);
      }
    } catch (error) {
      console.error(`Error fetching Tafsir for ${surahNumber}:${ayahNumber}:`, error);
      return this.getBasicTafsir(surahNumber, ayahNumber);
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
