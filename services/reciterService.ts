
import { ReciterWithImage } from '../types';

interface ReciterImages {
  [key: number]: string;
}

interface ReciterDescriptions {
  [key: number]: string;
}

// Service to get reciter information with images
class ReciterService {
  private reciterImages: ReciterImages = {
    2: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    7: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    3: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    6: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    11: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    9: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop&crop=face',
  };

  private reciterDescriptions: ReciterDescriptions = {
    2: 'قارئ مصري أسطوري بتلاوة مرتلة هادئة',
    7: 'قارئ سعودي مشهور بصوته العذب والمؤثر',
    3: 'قارئ سعودي بصوت جميل ومميز',
    6: 'قارئ سعودي وإمام الحرم المكي',
    11: 'قارئ سعودي بصوت رائع ومؤثر',
    9: 'قارئ سعودي وإمام الحرم المكي',
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
