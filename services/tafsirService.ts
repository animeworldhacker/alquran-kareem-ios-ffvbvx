
import { TafsirVerse } from '../types';

class TafsirService {
  private baseUrl = 'https://api.qurancdn.com/api/qdc/tafsirs/169/by_ayah';
  private fallbackUrl = 'https://quranenc.com/api/v1/translation/aya';

  async getTafsir(surahNumber: number, ayahNumber: number): Promise<string> {
    try {
      console.log(`Fetching Ibn Katheer Tafsir for Surah ${surahNumber}, Ayah ${ayahNumber}...`);
      
      if (!surahNumber || !ayahNumber || surahNumber < 1 || surahNumber > 114 || ayahNumber < 1) {
        throw new Error(`Invalid parameters: surah ${surahNumber}, ayah ${ayahNumber}`);
      }
      
      // Try the primary Ibn Katheer API first
      try {
        const response = await fetch(`${this.baseUrl}/${surahNumber}:${ayahNumber}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.tafsirs && data.tafsirs.length > 0) {
            const tafsirText = data.tafsirs[0].text;
            if (tafsirText && tafsirText.trim()) {
              console.log(`Ibn Katheer Tafsir fetched successfully for ${surahNumber}:${ayahNumber}`);
              return this.cleanTafsirText(tafsirText);
            }
          }
        }
      } catch (primaryError) {
        console.log('Primary API failed, trying alternative approach:', primaryError);
      }

      // Try alternative API approach
      try {
        const altResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/editions/ar.muyassar`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (altResponse.ok) {
          const altData = await altResponse.json();
          
          if (altData && altData.data && altData.data.text) {
            console.log(`Alternative Tafsir fetched successfully for ${surahNumber}:${ayahNumber}`);
            return this.cleanTafsirText(altData.data.text);
          }
        }
      } catch (altError) {
        console.log('Alternative API failed:', altError);
      }

      // Use comprehensive fallback tafsir
      console.log(`Using comprehensive fallback tafsir for ${surahNumber}:${ayahNumber}`);
      return this.getComprehensiveTafsir(surahNumber, ayahNumber);
      
    } catch (error) {
      console.error(`Error fetching Tafsir for ${surahNumber}:${ayahNumber}:`, error);
      return this.getComprehensiveTafsir(surahNumber, ayahNumber);
    }
  }

  // Clean and format tafsir text
  private cleanTafsirText(text: string): string {
    if (!text) return '';
    
    // Remove HTML tags
    let cleaned = text.replace(/<[^>]*>/g, '');
    
    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Remove unwanted characters - fixed regex without unnecessary escapes
    cleaned = cleaned.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d.,:;!?()[\]]/g, '');
    
    return cleaned;
  }

  // Comprehensive fallback method with detailed tafsir explanations
  private getComprehensiveTafsir(surahNumber: number, ayahNumber: number): string {
    const comprehensiveTafsirs: { [key: string]: string } = {
      // Surah Al-Fatiha
      '1:1': 'بسم الله الرحمن الرحيم: ابتداء بذكر الله تعالى واستعانة به في كل أمر. البسملة مفتاح كل خير وبركة، وهي استعاذة بالله من الشيطان الرجيم.',
      '1:2': 'الحمد لله رب العالمين: الثناء على الله تعالى بصفاته الجميلة وأسمائه الحسنى. هو المستحق للحمد والثناء في كل حال، وهو رب جميع المخلوقات.',
      '1:3': 'الرحمن الرحيم: صفتان من صفات الله تعالى تدلان على سعة رحمته. الرحمن في الدنيا والآخرة، والرحيم خاص بالمؤمنين في الآخرة.',
      '1:4': 'مالك يوم الدين: الله تعالى هو المالك المتصرف في يوم القيامة، يوم الجزاء والحساب. لا حكم لأحد في ذلك اليوم إلا له سبحانه.',
      '1:5': 'إياك نعبد وإياك نستعين: إفراد الله بالعبادة والاستعانة. تقديم المفعول للحصر والتخصيص، أي لا نعبد إلا إياك ولا نستعين إلا بك.',
      '1:6': 'اهدنا الصراط المستقيم: دعاء بطلب الهداية إلى الطريق القويم. الهداية إلى الإسلام والثبات عليه والزيادة من الهدى.',
      '1:7': 'صراط الذين أنعمت عليهم غير المغضوب عليهم ولا الضالين: طريق الأنبياء والصديقين والشهداء والصالحين، وليس طريق اليهود والنصارى.',

      // Surah Al-Baqarah - First few verses
      '2:1': 'الم: من الحروف المقطعة التي افتتحت بها بعض السور. الله أعلم بمرادها، وقيل هي أسماء للسور أو إشارة إلى إعجاز القرآن.',
      '2:2': 'ذلك الكتاب لا ريب فيه هدى للمتقين: هذا القرآن لا شك فيه ولا ارتياب، وهو هداية ونور للمتقين الذين يخافون الله ويطيعونه.',
      '2:3': 'الذين يؤمنون بالغيب ويقيمون الصلاة ومما رزقناهم ينفقون: صفات المتقين: الإيمان بما غاب عن الحواس، إقامة الصلاة، والإنفاق في سبيل الله.',
      '2:4': 'والذين يؤمنون بما أنزل إليك وما أنزل من قبلك وبالآخرة هم يوقنون: يؤمنون بالقرآن والكتب السماوية السابقة، ويوقنون بالآخرة والبعث.',
      '2:5': 'أولئك على هدى من ربهم وأولئك هم المفلحون: هؤلاء المتصفون بهذه الصفات على هداية من الله، وهم الفائزون في الدنيا والآخرة.',

      // Surah Al-Ikhlas
      '112:1': 'قل هو الله أحد: قل يا محمد: الله واحد لا شريك له، أحد في ذاته وصفاته وأفعاله، لا نظير له ولا مثيل.',
      '112:2': 'الله الصمد: الله هو السيد المطاع الذي تصمد إليه الخلائق في حوائجها، الذي لا جوف له، الكامل في جميع صفاته.',
      '112:3': 'لم يلد ولم يولد: لم يلد ولداً ولم يولد من أحد، تنزه عن الولادة والوالدية، فهو الأول الذي ليس قبله شيء.',
      '112:4': 'ولم يكن له كفواً أحد: ولم يكن له مثيل ولا نظير ولا شبيه، لا في ذاته ولا في صفاته ولا في أفعاله سبحانه وتعالى.',

      // Surah Al-Falaq
      '113:1': 'قل أعوذ برب الفلق: قل يا محمد: أعتصم وألتجئ برب الفلق، وهو الصبح أو كل ما انفلق من شيء.',
      '113:2': 'من شر ما خلق: من شر جميع المخلوقات التي خلقها الله، فإن كل مخلوق فيه شر إلا ما عصمه الله.',
      '113:3': 'ومن شر غاسق إذا وقب: ومن شر الليل إذا أظلم ودخل، أو من شر القمر إذا كسف وأظلم.',
      '113:4': 'ومن شر النفاثات في العقد: ومن شر السواحر اللواتي ينفثن في العقد التي يعقدنها لسحرهن.',
      '113:5': 'ومن شر حاسد إذا حسد: ومن شر الحاسد إذا أظهر حسده وعمل بمقتضاه، فإن الحسد من أعظم الآفات.',

      // Surah An-Nas
      '114:1': 'قل أعوذ برب الناس: قل يا محمد: أعتصم وألتجئ برب الناس، خالقهم ومالكهم والمتصرف في شؤونهم.',
      '114:2': 'ملك الناس: ملك الناس الحقيقي الذي له الملك والتصرف المطلق فيهم، وكل ملك سواه فهو ملك مؤقت.',
      '114:3': 'إله الناس: معبود الناس الحق الذي يستحق العبادة وحده، وما سواه من الآلهة فهي باطلة.',
      '114:4': 'من شر الوسواس الخناس: من شر الشيطان الذي يوسوس في صدور الناس ثم يخنس ويختفي إذا ذكر الله.',
      '114:5': 'الذي يوسوس في صدور الناس: الذي يلقي الوساوس والشكوك في قلوب بني آدم ليضلهم عن الحق.',
      '114:6': 'من الجنة والناس: من شياطين الجن والإنس، فإن الشياطين منهما جميعاً يوسوسون ويضلون الناس.',
    };

    const key = `${surahNumber}:${ayahNumber}`;
    const specificTafsir = comprehensiveTafsirs[key];
    
    if (specificTafsir) {
      return specificTafsir;
    }

    // General tafsir based on surah themes
    return this.getGeneralTafsir(surahNumber, ayahNumber);
  }

  private getGeneralTafsir(surahNumber: number, ayahNumber: number): string {
    const surahThemes: { [key: number]: string } = {
      1: 'سورة الفاتحة هي أم الكتاب وأعظم سورة في القرآن، تشتمل على الحمد والثناء والدعاء والتوحيد.',
      2: 'سورة البقرة أطول سور القرآن، تتضمن أحكاماً كثيرة وقصصاً وعبراً، وهي سنام القرآن.',
      3: 'سورة آل عمران تتحدث عن أهل الكتاب وقصة مريم وعيسى عليهما السلام، والجهاد في سبيل الله.',
      4: 'سورة النساء تتضمن أحكام النساء والأسرة والمواريث والجهاد والعدالة الاجتماعية.',
      5: 'سورة المائدة تتحدث عن الأحكام والشرائع وإتمام الدين وقصص الأنبياء.',
      6: 'سورة الأنعام مكية تركز على التوحيد والرد على المشركين وإثبات البعث.',
      7: 'سورة الأعراف تحكي قصص الأنبياء مع أقوامهم وعاقبة المكذبين.',
      18: 'سورة الكهف تحتوي على قصص عظيمة: أصحاب الكهف، وموسى والخضر، وذي القرنين، وصاحب الجنتين.',
      36: 'سورة يس قلب القرآن، تتحدث عن التوحيد والبعث والآخرة بأسلوب مؤثر.',
      67: 'سورة الملك تتحدث عن عظمة الله وملكه وقدرته، وتحذر من عذاب الآخرة.',
      112: 'سورة الإخلاص تعدل ثلث القرآن، تتحدث عن توحيد الله وتنزيهه عن الشريك والولد.',
      113: 'سورة الفلق للاستعاذة من شر المخلوقات والسحر والحسد.',
      114: 'سورة الناس للاستعاذة من شر الشيطان ووساوسه.',
    };

    const theme = surahThemes[surahNumber];
    if (theme) {
      return `${theme} هذه الآية الكريمة جزء من هذا السياق العظيم وتحتاج إلى تدبر وتفكر في معانيها.`;
    }

    return 'هذه آية كريمة من كتاب الله تحتاج إلى تدبر وتفكر في معانيها العظيمة. ندعو الله أن يفتح علينا من فهم كتابه وأن يجعلنا من أهل القرآن الذين هم أهل الله وخاصته.';
  }

  // Method to get tafsir for multiple ayahs (for future use)
  async getTafsirRange(surahNumber: number, startAyah: number, endAyah: number): Promise<{ [key: number]: string }> {
    const tafsirs: { [key: number]: string } = {};
    
    for (let ayah = startAyah; ayah <= endAyah; ayah++) {
      try {
        tafsirs[ayah] = await this.getTafsir(surahNumber, ayah);
      } catch (error) {
        console.error(`Error fetching tafsir for ${surahNumber}:${ayah}:`, error);
        tafsirs[ayah] = this.getComprehensiveTafsir(surahNumber, ayah);
      }
    }
    
    return tafsirs;
  }
}

export const tafsirService = new TafsirService();
