
import { ReciterWithImage } from '../types';

// Service to get reciter information with images
class ReciterService {
  private reciterImages: { [key: number]: string } = {
    1: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    2: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    3: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    4: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    5: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    6: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    7: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
    8: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
    9: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    10: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=150&h=150&fit=crop&crop=face',
    11: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face',
    12: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    13: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face',
    14: 'https://images.unsplash.com/photo-1558203728-00f45181dd84?w=150&h=150&fit=crop&crop=face',
    15: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=face',
  };

  private reciterDescriptions: { [key: number]: string } = {
    1: 'قارئ مصري مشهور بصوته العذب والتلاوة المرتلة',
    2: 'قارئ كويتي معاصر بصوت جميل ومؤثر',
    3: 'من أشهر القراء في العالم الإسلامي',
    4: 'قارئ مصري بصوت مجود رائع',
    5: 'إمام الحرم المكي وقارئ سعودي مميز',
    6: 'إمام الحرم المكي بصوت هادئ ومؤثر',
    7: 'قارئ سعودي شاب بصوت جميل',
    8: 'قارئ مصري كلاسيكي بأسلوب تعليمي',
    9: 'إمام الحرم المكي الشريف',
    10: 'إمام الحرم المكي بصوت مميز',
    11: 'قارئ سعودي معاصر',
    12: 'قارئ سعودي بصوت هادئ',
    13: 'قارئ سعودي مؤثر',
    14: 'قارئ عراقي بصوت جميل',
    15: 'قارئ سعودي معاصر',
  };

  getReciterWithImage(reciter: any): ReciterWithImage {
    return {
      ...reciter,
      image: this.reciterImages[reciter.id] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      description: this.reciterDescriptions[reciter.id] || 'قارئ للقرآن الكريم',
    };
  }

  getRecitersWithImages(reciters: any[]): ReciterWithImage[] {
    return reciters.map(reciter => this.getReciterWithImage(reciter));
  }
}

export const reciterService = new ReciterService();
