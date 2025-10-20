
import { ReciterWithImage } from '../types';

// Service to get reciter information with images
class ReciterService {
  private reciterImages: { [key: number]: string } = {
    7: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    3: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    2: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    4: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    8: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  };

  private reciterDescriptions: { [key: number]: string } = {
    7: 'قارئ سعودي بصوت عذب ومؤثر',
    3: 'قارئ سعودي مشهور بتلاوته الخاشعة',
    2: 'قارئ مصري أسطوري بصوت رائع',
    4: 'إمام الحرم المكي بصوت هادئ ومميز',
    8: 'قارئ سعودي معاصر بصوت جميل',
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
